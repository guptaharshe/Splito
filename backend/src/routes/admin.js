const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Middleware to enforce Admin only
router.use(authMiddleware);
router.use(async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admins only' });
  }
  next();
});

// GET /api/admin/analytics - System wide analytics
router.get('/analytics', async (req, res) => {
  try {
    // Total Users count
    const { count: totalUsers, error: err1 } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    if (err1) throw err1;

    // Total Groups count
    const { count: totalGroups, error: err2 } = await supabase
      .from('groups')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);
    if (err2) throw err2;

    // Total Expense Volume
    const { data: expenses, error: err3 } = await supabase
      .from('expenses')
      .select('amount_paise')
      .is('deleted_at', null);
    if (err3) throw err3;

    const totalVolumePaise = expenses.reduce((acc, curr) => acc + parseInt(curr.amount_paise || 0, 10), 0);

    // Total Imports run
    const { count: totalImports, error: err4 } = await supabase
      .from('import_batches')
      .select('*', { count: 'exact', head: true });
    if (err4) throw err4;

    res.json({
      totalUsers: totalUsers || 0,
      totalGroups: totalGroups || 0,
      totalVolumePaise,
      totalImports: totalImports || 0
    });
  } catch (err) {
    console.error('Admin analytics error:', err);
    res.status(500).json({ error: 'Failed to load analytics' });
  }
});

module.exports = router;
