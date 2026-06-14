const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { computeGroupBalances } = require('../services/balanceEngine');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

router.use(authMiddleware);

// GET /api/groups/:id/balances -> Get net balances and pairwise debts
router.get('/groups/:id/balances', async (req, res) => {
  const groupId = req.params.id;

  try {
    const { balances, pairwise } = await computeGroupBalances(groupId);

    // Fetch user details for richer payload
    const userIds = Object.keys(balances);
    if (userIds.length === 0) {
      return res.json({ balances: [], pairwise: [] });
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('id, name')
      .in('id', userIds);

    if (error) throw error;

    const userMap = {};
    users.forEach(u => { userMap[u.id] = u.name; });

    // Enhance the balances object with names
    const enrichedBalances = Object.entries(balances).map(([userId, amount]) => ({
      user_id: userId,
      name: userMap[userId] || 'Unknown',
      net_balance_paise: amount
    }));

    // Enhance the pairwise object with names
    const enrichedPairwise = pairwise.map(p => ({
      from_user_id: p.from,
      from_user_name: userMap[p.from] || 'Unknown',
      to_user_id: p.to,
      to_user_name: userMap[p.to] || 'Unknown',
      amount_paise: p.amount
    }));

    res.json({
      balances: enrichedBalances,
      pairwise: enrichedPairwise
    });

  } catch (err) {
    console.error('Fetch balances error:', err);
    res.status(500).json({ error: 'Failed to compute balances' });
  }
});

// GET /api/balances/net - get overall net balance for current user
router.get('/balances/net', async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Total expenses paid by me
    const { data: paidExpenses, error: err1 } = await supabase
      .from('expenses')
      .select('amount_paise')
      .eq('paid_by', userId)
      .is('deleted_at', null);
      
    if (err1) throw err1;

    // 2. My share of all expenses
    const { data: mySplits, error: err2 } = await supabase
      .from('expense_splits')
      .select('amount_paise, expenses!inner(deleted_at)')
      .eq('user_id', userId)
      .is('expenses.deleted_at', null);

    if (err2) throw err2;

    // 3. Settlements paid by me
    const { data: paidSettlements, error: err3 } = await supabase
      .from('settlements')
      .select('amount_paise')
      .eq('paid_by', userId)
      .is('deleted_at', null);

    if (err3) throw err3;

    // 4. Settlements paid to me
    const { data: receivedSettlements, error: err4 } = await supabase
      .from('settlements')
      .select('amount_paise')
      .eq('paid_to', userId)
      .is('deleted_at', null);

    if (err4) throw err4;

    // Calculate sums
    const sumPaidExpenses = paidExpenses.reduce((acc, curr) => acc + parseInt(curr.amount_paise, 10), 0);
    const sumMySplits = mySplits.reduce((acc, curr) => acc + parseInt(curr.amount_paise, 10), 0);
    const sumPaidSettlements = paidSettlements.reduce((acc, curr) => acc + parseInt(curr.amount_paise, 10), 0);
    const sumReceivedSettlements = receivedSettlements.reduce((acc, curr) => acc + parseInt(curr.amount_paise, 10), 0);

    // Final Net Balance Formula
    const netBalancePaise = (sumPaidExpenses - sumMySplits) + (sumPaidSettlements - sumReceivedSettlements);

    res.json({ netBalancePaise });
  } catch (err) {
    console.error('Fetch net balance error:', err);
    res.status(500).json({ error: 'Failed to calculate net balance' });
  }
});

module.exports = router;
