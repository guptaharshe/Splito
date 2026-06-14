/**
 * Split Calculation Service
 * 
 * Computes individual amounts for an expense based on the split type.
 * All functions return an array of { user_id, amount_paise }.
 * 
 * For rounding issues (e.g., 100 paise split 3 ways is 33.333),
 * the remainder is always added to the payer's share (or the first person if payer isn't in split).
 */

/**
 * Split equally among all participants
 */
function calculateEqualSplit(totalAmountPaise, splitWithIds, paidById) {
  const numPeople = splitWithIds.length;
  if (numPeople === 0) return [];

  const baseShare = Math.floor(totalAmountPaise / numPeople);
  const remainder = totalAmountPaise % numPeople;

  return splitWithIds.map(userId => {
    // Add remainder to the payer, or to the first user if payer is not in the split
    let amount = baseShare;
    if (userId === paidById || (!splitWithIds.includes(paidById) && userId === splitWithIds[0])) {
      amount += remainder;
    }
    return { user_id: userId, amount_paise: amount };
  });
}

/**
 * Unequal split based on explicit amounts.
 * Total explicitly supplied amounts must exactly equal the total expense amount.
 */
function calculateUnequalSplit(totalAmountPaise, splitsArr) {
  const calculatedTotal = splitsArr.reduce((sum, split) => sum + split.amount_paise, 0);
  if (calculatedTotal !== totalAmountPaise) {
    throw new Error(`Unequal split amounts (${calculatedTotal}) must sum to the exact expense amount (${totalAmountPaise})`);
  }

  return splitsArr.map(split => ({
    user_id: split.user_id,
    amount_paise: split.amount_paise
  }));
}

/**
 * Percentage split. Percentages must sum exactly to 100.
 */
function calculatePercentageSplit(totalAmountPaise, splitsArr, paidById) {
  const totalPercentage = splitsArr.reduce((sum, split) => sum + split.percentage, 0);
  // Need precise checking, floating point math might cause 99.999999
  if (Math.abs(totalPercentage - 100) > 0.01) {
    throw new Error(`Percentages (${totalPercentage}%) must sum to exactly 100%`);
  }

  let allocated = 0;
  const results = splitsArr.map(split => {
    // Calculate fractional amount and floor it
    const amount = Math.floor(totalAmountPaise * (split.percentage / 100));
    allocated += amount;
    return {
      user_id: split.user_id,
      amount_paise: amount,
      percentage: split.percentage
    };
  });

  const remainder = totalAmountPaise - allocated;
  if (remainder > 0) {
    // Add remainder to the payer if they are in the split, otherwise to the first user
    const payerSplit = results.find(s => s.user_id === paidById);
    if (payerSplit) {
      payerSplit.amount_paise += remainder;
    } else if (results.length > 0) {
      results[0].amount_paise += remainder;
    }
  }

  return results;
}

/**
 * Share-based split.
 */
function calculateShareSplit(totalAmountPaise, splitsArr, paidById) {
  const totalShares = splitsArr.reduce((sum, split) => sum + split.share_units, 0);
  if (totalShares <= 0) {
    throw new Error('Total shares must be greater than 0');
  }

  let allocated = 0;
  const results = splitsArr.map(split => {
    const amount = Math.floor(totalAmountPaise * (split.share_units / totalShares));
    allocated += amount;
    return {
      user_id: split.user_id,
      amount_paise: amount,
      share_units: split.share_units
    };
  });

  const remainder = totalAmountPaise - allocated;
  if (remainder > 0) {
    // Add remainder to the payer if they are in the split, otherwise to the first user
    const payerSplit = results.find(s => s.user_id === paidById);
    if (payerSplit) {
      payerSplit.amount_paise += remainder;
    } else if (results.length > 0) {
      results[0].amount_paise += remainder;
    }
  }

  return results;
}

module.exports = {
  calculateEqualSplit,
  calculateUnequalSplit,
  calculatePercentageSplit,
  calculateShareSplit
};
