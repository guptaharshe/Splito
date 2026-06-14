/**
 * Balance Engine
 * 
 * Computes pairwise debts between users in a group based on expenses, 
 * expense splits, and settlements.
 */
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

/**
 * Computes the net balances for a group.
 * Returns:
 * {
 *   balances: { [userId]: netBalancePaise }, 
 *   pairwise: [ { from: userId, to: userId, amount: paise } ],
 *   simplifications: [ { from, to, amount } ] // Future optimization
 * }
 */
async function computeGroupBalances(groupId) {
  // 1. Fetch all non-deleted expenses and their splits for the group
  const { data: expenses, error: expensesError } = await supabase
    .from('expenses')
    .select(`
      id, paid_by, amount_paise,
      expense_splits(user_id, amount_paise)
    `)
    .eq('group_id', groupId)
    .is('deleted_at', null);

  if (expensesError) throw expensesError;

  // 2. Fetch all non-deleted settlements for the group
  const { data: settlements, error: settlementsError } = await supabase
    .from('settlements')
    .select('paid_by, paid_to, amount_paise')
    .eq('group_id', groupId)
    .is('deleted_at', null);

  if (settlementsError) throw settlementsError;

  // Map to store net balances: userId -> net amount (positive means they are owed money, negative means they owe money)
  const balances = {};
  
  // Map to store pairwise raw debts: "debtorId_creditorId" -> amount
  // Instead of a string key, we'll maintain a nested object: pairwise[debtor][creditor] = amount
  const pairwise = {};

  const initUser = (userId) => {
    if (balances[userId] === undefined) balances[userId] = 0;
    if (!pairwise[userId]) pairwise[userId] = {};
  };

  // Process expenses
  for (const expense of expenses) {
    const paidBy = expense.paid_by;
    initUser(paidBy);

    for (const split of expense.expense_splits) {
      const splitUser = split.user_id;
      const amount = split.amount_paise;

      initUser(splitUser);

      // Effect on net balances
      balances[paidBy] += amount; // Payer is owed this split amount
      balances[splitUser] -= amount; // Split user owes this amount

      // Effect on pairwise debts (Split User owes Paid By)
      if (splitUser !== paidBy) {
        pairwise[splitUser][paidBy] = (pairwise[splitUser][paidBy] || 0) + amount;
      }
    }
  }

  // Process settlements
  for (const settlement of settlements) {
    const payer = settlement.paid_by;
    const receiver = settlement.paid_to;
    const amount = settlement.amount_paise;

    initUser(payer);
    initUser(receiver);

    // Effect on net balances
    balances[payer] += amount; // Payer settled some debt, their balance goes up
    balances[receiver] -= amount; // Receiver got paid, their balance goes down

    // Effect on pairwise debts
    // Settlement offsets debt from payer to receiver
    pairwise[payer][receiver] = (pairwise[payer][receiver] || 0) - amount;
  }

  // Optimize pairwise debts (Net off A->B and B->A)
  const netPairwise = [];
  const userIds = Object.keys(pairwise);
  
  for (let i = 0; i < userIds.length; i++) {
    for (let j = i + 1; j < userIds.length; j++) {
      const u1 = userIds[i];
      const u2 = userIds[j];

      const u1OwesU2 = pairwise[u1][u2] || 0;
      const u2OwesU1 = pairwise[u2][u1] || 0;

      const net = u1OwesU2 - u2OwesU1;

      if (net > 0) {
        netPairwise.push({ from: u1, to: u2, amount: net });
      } else if (net < 0) {
        netPairwise.push({ from: u2, to: u1, amount: -net });
      }
    }
  }

  return {
    balances,
    pairwise: netPairwise,
  };
}

module.exports = {
  computeGroupBalances
};
