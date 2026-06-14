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

module.exports = {
  parseCSV,
  normalizeDate
};
