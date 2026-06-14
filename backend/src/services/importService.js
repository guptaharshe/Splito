const fs = require('fs');
const csv = require('csv-parser');

/**
 * Parses the raw CSV file and returns an array of normalized row objects.
 * Handles dates, trims whitespace, lowercases names, strips commas from amounts.
 */
async function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    let rowNumber = 1; // 1-indexed, though usually row 1 is headers

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        rowNumber++;
        results.push({
          rowNumber,
          original: data,
          // Normalize immediately
          date: data.Date ? data.Date.trim() : '',
          description: data.Description ? data.Description.trim() : '',
          paidBy: data['Paid By'] ? data['Paid By'].trim() : '',
          amount: data.Amount ? data.Amount.trim() : '',
          currency: data.Currency ? data.Currency.trim() : '',
          splitType: data['Split Type'] ? data['Split Type'].trim() : '',
          splitDetails: data['Split Details'] ? data['Split Details'].trim() : '',
          notes: data.Notes ? data.Notes.trim() : ''
        });
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

/**
 * Attempts to parse a date string into YYYY-MM-DD.
 * Handles DD-MM-YYYY, YYYY-MM-DD, and weird formats like Mar-14.
 */
function normalizeDate(dateStr) {
  if (!dateStr) return null;

  // Format: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // Format: DD-MM-YYYY
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
    const [dd, mm, yyyy] = dateStr.split('-');
    return `${yyyy}-${mm}-${dd}`;
  }

  // Format: Mar-14 (assume current/given year, assignment implies 2026)
  if (/^[A-Za-z]{3}-\d{2}$/.test(dateStr)) {
    const [mon, dd] = dateStr.split('-');
    const months = { Jan:'01', Feb:'02', Mar:'03', Apr:'04', May:'05', Jun:'06', Jul:'07', Aug:'08', Sep:'09', Oct:'10', Nov:'11', Dec:'12' };
    const mm = months[mon.substring(0,3)];
    if (mm) return `2026-${mm}-${dd}`;
  }

  return dateStr; // Fallback, let anomaly detector flag it or DB reject it
}

/**
 * Detects anomalies in the parsed CSV rows.
 * @param {Array} rows Parsed and normalized CSV rows
 * @param {Array} knownUsers Array of user objects { id, name }
 */
function detectAnomalies(rows, knownUsers) {
  const anomalies = [];
  const cleanRows = [];
  const userMap = {};
  knownUsers.forEach(u => userMap[u.name.toLowerCase()] = u);

  // For exact/conflicting duplicate detection
  const hashmap = new Map();

  rows.forEach(row => {
    let isClean = true;
    let finalRow = { ...row };
    
    const flag = (type, detail, suggestedAction, severity) => {
      anomalies.push({
        rowNumber: row.rowNumber,
        rawRow: row.original,
        anomalyType: type,
        anomalyDetail: detail,
        suggestedAction,
        severity
      });
      isClean = false;
    };

    // 13. Zero Amount
    if (parseFloat(row.amount) === 0) {
      flag('Zero Amount', 'Expense amount is 0.', 'Skip this row.', 'INFO');
      return; // Skip further processing for this row
    }

    // 2. Comma in amount
    if (row.amount && row.amount.includes(',')) {
      finalRow.amount = row.amount.replace(/,/g, '');
      flag('Comma in amount', `Parsed amount from "${row.amount}" to ${finalRow.amount}.`, 'Auto-corrected.', 'INFO');
    }

    // 10. Negative amount (Refund)
    if (parseFloat(finalRow.amount) < 0) {
      flag('Negative amount', `Amount is negative (${finalRow.amount}).`, 'Treated as refund.', 'INFO');
    }

    // 4. Missing payer
    if (!row.paidBy) {
      flag('Missing payer', 'Paid By field is empty.', 'Skip this row or assign manually.', 'BLOCKING');
    } else {
      // 17. Trailing space
      if (row.original['Paid By'] && row.original['Paid By'].trim() !== row.original['Paid By']) {
        flag('Trailing space', `Paid By had trailing spaces.`, 'Auto-trimmed.', 'INFO');
      }

      // 16. Name case inconsistency
      const lowerPayer = row.paidBy.toLowerCase();
      if (userMap[lowerPayer] && userMap[lowerPayer].name !== row.paidBy) {
        flag('Name case', `Payer name "${row.paidBy}" differs in case from "${userMap[lowerPayer].name}".`, 'Auto-normalized.', 'INFO');
        finalRow.paidBy = userMap[lowerPayer].name;
      }

      // 3. Unknown payer
      if (!userMap[lowerPayer]) {
        // Simple fuzzy match placeholder
        flag('Unknown payer', `Payer "${row.paidBy}" not found in system.`, `Map to closest match manually.`, 'BLOCKING');
      }
    }

    // 5. Settlement logged as expense
    const descLower = row.description.toLowerCase();
    if (descLower.includes('paid back') || descLower.includes('settled') || descLower.includes('settlement')) {
      flag('Settlement as expense', 'Description implies this is a settlement payment, not an expense.', 'Import as settlement.', 'BLOCKING');
    }

    // 7. USD Currency & 12. Missing Currency
    if (!row.currency) {
      finalRow.currency = 'INR';
      flag('Missing currency', 'Currency field is empty.', 'Defaulted to INR.', 'INFO');
    } else if (row.currency.toUpperCase() === 'USD') {
      flag('USD currency', 'Amount is in USD.', 'Converted to INR at ₹84.00/USD.', 'INFO');
      finalRow.exchangeRate = 84.0;
      finalRow.amount = String(parseFloat(finalRow.amount) * 84.0);
      finalRow.currency = 'INR';
    }

    // 11. Malformed Date & 14. Ambiguous Date
    const normDate = normalizeDate(row.date);
    if (normDate !== row.date) {
      if (/^[A-Za-z]{3}-\d{2}$/.test(row.date)) {
        flag('Malformed date', `Date "${row.date}" is non-standard.`, `Parsed as ${normDate}.`, 'INFO');
      } else {
        flag('Ambiguous date format', `Date "${row.date}" might be ambiguous (DD-MM vs MM-DD).`, `Parsed as ${normDate}.`, 'BLOCKING');
      }
      finalRow.date = normDate;
    }

    // Duplicate Detection (1. Exact, 9. Conflicting)
    const hashKey = `${normDate}_${descLower.substring(0, 10)}`;
    if (hashmap.has(hashKey)) {
      const existing = hashmap.get(hashKey);
      if (existing.paidBy === finalRow.paidBy && existing.amount === finalRow.amount) {
        flag('Exact duplicate', `Matches Row ${existing.rowNumber} exactly.`, `Skip this row, keep Row ${existing.rowNumber}.`, 'BLOCKING');
      } else {
        flag('Conflicting duplicate', `Similar to Row ${existing.rowNumber} but amounts/payers differ.`, `Manually select which to keep.`, 'BLOCKING');
      }
    } else {
      hashmap.set(hashKey, finalRow);
    }

    // Split anomalies (6, 8, 15, 18)
    if (row.splitType.toLowerCase() === 'equal' && row.splitDetails) {
      flag('Conflicting split_type', 'Split type is equal but split details are provided.', 'Ignored split details.', 'INFO');
    }

    if (row.splitType.toLowerCase() === 'percentage' && row.splitDetails) {
      const pctMatches = row.splitDetails.match(/(\d+)%/g);
      if (pctMatches) {
        const sum = pctMatches.reduce((acc, val) => acc + parseInt(val), 0);
        if (sum !== 100) {
          flag('Percentages do not sum to 100%', `Sum is ${sum}%.`, 'Manually correct percentages.', 'BLOCKING');
        }
      }
    }

    if (row.splitDetails) {
      const names = row.splitDetails.match(/[A-Z][a-z]+/g) || [];
      names.forEach(name => {
        if (!userMap[name.toLowerCase()]) {
          flag('Non-member in split', `User "${name}" is not a known member.`, 'Exclude from split.', 'BLOCKING');
        }
      });
    }

    // Timeline anomalies
    const expenseDateStr = finalRow.date;
    if (expenseDateStr && !isNaN(new Date(expenseDateStr).getTime())) {
      const expenseDate = new Date(expenseDateStr);
      const checkTimeline = (userName, roleContext) => {
        const u = userMap[userName.toLowerCase()];
        if (!u) return;
        if (u.joined_at && expenseDate < new Date(u.joined_at.split('T')[0])) {
          flag('Timeline violation', `${userName} (${roleContext}) is involved on ${expenseDateStr} but joined on ${u.joined_at.split('T')[0]}.`, 'Exclude user or correct date.', 'BLOCKING');
        }
        if (u.left_at && expenseDate > new Date(u.left_at.split('T')[0])) {
          flag('Timeline violation', `${userName} (${roleContext}) is involved on ${expenseDateStr} but left on ${u.left_at.split('T')[0]}.`, 'Exclude user or correct date.', 'BLOCKING');
        }
      };

      if (finalRow.paidBy) checkTimeline(finalRow.paidBy, 'Payer');
      
      if (row.splitDetails) {
        const names = row.splitDetails.match(/[A-Z][a-z]+/g) || [];
        names.forEach(name => checkTimeline(name, 'Split member'));
      }
    }

    if (isClean) {
      cleanRows.push(finalRow);
    }
  });

  return { cleanRows, anomalies };
}

module.exports = {
  parseCSV,
  normalizeDate,
  detectAnomalies
};
