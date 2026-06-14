const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

router.use(authMiddleware);

// GET /api/groups/:id/settlements
router.get('/groups/:id/settlements', async (req, res) => {
  const groupId = req.params.id;

  try {
    const { data: settlements, error } = await supabase
      .from('settlements')
      .select(`
        *,
        payer:users!settlements_paid_by_fkey(id, name),
        receiver:users!settlements_paid_to_fkey(id, name)
      `)
      .eq('group_id', groupId)
      .is('deleted_at', null)
      .order('settlement_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ settlements });
  } catch (err) {
    console.error('Fetch settlements error:', err);
    res.status(500).json({ error: 'Failed to fetch settlements' });
  }
});

// POST /api/groups/:id/settlements
router.post('/groups/:id/settlements', async (req, res) => {
  const groupId = req.params.id;
  const { paid_by, paid_to, amount_paise, settlement_date, notes } = req.body;

  if (!paid_by || !paid_to || !amount_paise || !settlement_date) {
    return res.status(400).json({ error: 'Missing required settlement fields' });
  }

  try {
    const { data: settlement, error } = await supabase
      .from('settlements')
      .insert({
        group_id: groupId,
        paid_by,
        paid_to,
        amount_paise,
        settlement_date,
        notes
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ settlement });
  } catch (err) {
    console.error('Create settlement error:', err);
    res.status(500).json({ error: 'Failed to create settlement' });
  }
});

// DELETE /api/settlements/:id (soft delete)
router.delete('/settlements/:id', async (req, res) => {
  const settlementId = req.params.id;

  try {
    const { error } = await supabase
      .from('settlements')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', settlementId);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error('Delete settlement error:', err);
    res.status(500).json({ error: 'Failed to delete settlement' });
  }
});

module.exports = router;
