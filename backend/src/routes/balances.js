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

module.exports = router;
