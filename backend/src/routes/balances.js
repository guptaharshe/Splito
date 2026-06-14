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

// GET /api/balances/net - get overall net balance and analytics for current user
router.get('/balances/net', async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch all groups the user is a member of
    const { data: members, error: memErr } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', userId)
      .is('left_at', null);

    if (memErr) throw memErr;

    let totalOwedToYou = 0;
    let totalYouOwe = 0;
    
    // 2. Compute balances per group to get exact owed/owes
    for (const member of members || []) {
      const { balances } = await computeGroupBalances(member.group_id);
      const myBalance = balances[userId] || 0;
      if (myBalance > 0) {
        totalOwedToYou += myBalance;
      } else if (myBalance < 0) {
        totalYouOwe += Math.abs(myBalance);
      }
    }

    const netBalancePaise = totalOwedToYou - totalYouOwe;

    // 3. Count total expenses the user is involved in
    const { count: expensesCount, error: expErr } = await supabase
      .from('expense_splits')
      .select('expense_id, expenses!inner(deleted_at)', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('expenses.deleted_at', null);

    if (expErr) throw expErr;

    res.json({ 
      netBalancePaise,
      totalOwedToYou,
      totalYouOwe,
      totalGroups: (members || []).length,
      totalExpenses: expensesCount || 0
    });
  } catch (err) {
    console.error('Fetch net balance error:', err);
    res.status(500).json({ error: 'Failed to calculate net balance' });
  }
});

module.exports = router;
