const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { authMiddleware } = require('../middleware/auth');
const splitService = require('../services/splitService');

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

router.use(authMiddleware);

// GET /api/groups/:id/expenses -> list expenses for group
router.get('/groups/:id/expenses', async (req, res) => {
  const groupId = req.params.id;

  try {
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select(`
        *,
        paid_by_user:users!expenses_paid_by_fkey(id, name),
        expense_splits(*)
      `)
      .eq('group_id', groupId)
      .is('deleted_at', null)
      .order('expense_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ expenses });
  } catch (err) {
    console.error('Fetch expenses error:', err);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// POST /api/groups/:id/expenses -> create expense
router.post('/groups/:id/expenses', async (req, res) => {
  const groupId = req.params.id;
  const { 
    description, amount_paise, original_amount, original_currency, exchange_rate,
    paid_by, expense_date, split_type, notes, splits
  } = req.body;

  try {
    // 1. Calculate the exact splits
    let calculatedSplits = [];
    if (split_type === 'equal') {
      const splitWithIds = splits.map(s => s.user_id);
      calculatedSplits = splitService.calculateEqualSplit(amount_paise, splitWithIds, paid_by);
    } else if (split_type === 'unequal') {
      calculatedSplits = splitService.calculateUnequalSplit(amount_paise, splits);
    } else if (split_type === 'percentage') {
      calculatedSplits = splitService.calculatePercentageSplit(amount_paise, splits, paid_by);
    } else if (split_type === 'share') {
      calculatedSplits = splitService.calculateShareSplit(amount_paise, splits, paid_by);
    } else {
      return res.status(400).json({ error: 'Invalid split_type' });
    }

    // 2. Insert expense
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .insert({
        group_id: groupId,
        description,
        amount_paise,
        original_amount,
        original_currency,
        exchange_rate,
        paid_by,
        expense_date,
        split_type,
        notes
      })
      .select()
      .single();

    if (expenseError) throw expenseError;

    // 3. Insert splits
    const splitsToInsert = calculatedSplits.map(s => ({
      expense_id: expense.id,
      ...s
    }));

    const { error: splitsError } = await supabase
      .from('expense_splits')
      .insert(splitsToInsert);

    if (splitsError) {
      // Rollback expense if splits fail (since no transaction here, manual delete)
      await supabase.from('expenses').delete().eq('id', expense.id);
      throw splitsError;
    }

    res.status(201).json({ expense, splits: splitsToInsert });
  } catch (err) {
    console.error('Create expense error:', err.message);
    res.status(400).json({ error: err.message || 'Failed to create expense' });
  }
});

// GET /api/expenses/:id -> expense detail + splits
router.get('/expenses/:id', async (req, res) => {
  const expenseId = req.params.id;

  try {
    const { data: expense, error } = await supabase
      .from('expenses')
      .select(`
        *,
        paid_by_user:users!expenses_paid_by_fkey(id, name),
        expense_splits(
          *,
          user:users(id, name)
        )
      `)
      .eq('id', expenseId)
      .is('deleted_at', null)
      .single();

    if (error || !expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ expense });
  } catch (err) {
    console.error('Fetch expense detail error:', err);
    res.status(500).json({ error: 'Failed to fetch expense details' });
  }
});

// PUT /api/expenses/:id -> update expense
router.put('/expenses/:id', async (req, res) => {
  const expenseId = req.params.id;
  const { 
    description, amount_paise, original_amount, original_currency, exchange_rate,
    paid_by, expense_date, split_type, notes, splits
  } = req.body;

  try {
    // 1. Calculate the exact splits
    let calculatedSplits = [];
    if (split_type === 'equal') {
      const splitWithIds = splits.map(s => s.user_id);
      calculatedSplits = splitService.calculateEqualSplit(amount_paise, splitWithIds, paid_by);
    } else if (split_type === 'unequal') {
      calculatedSplits = splitService.calculateUnequalSplit(amount_paise, splits);
    } else if (split_type === 'percentage') {
      calculatedSplits = splitService.calculatePercentageSplit(amount_paise, splits, paid_by);
    } else if (split_type === 'share') {
      calculatedSplits = splitService.calculateShareSplit(amount_paise, splits, paid_by);
    } else {
      return res.status(400).json({ error: 'Invalid split_type' });
    }

    // 2. Update expense
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .update({
        description, amount_paise, original_amount, original_currency, exchange_rate,
        paid_by, expense_date, split_type, notes, updated_at: new Date().toISOString()
      })
      .eq('id', expenseId)
      .is('deleted_at', null)
      .select()
      .single();

    if (expenseError) throw expenseError;

    // 3. Delete old splits
    await supabase.from('expense_splits').delete().eq('expense_id', expenseId);

    // 4. Insert new splits
    const splitsToInsert = calculatedSplits.map(s => ({
      expense_id: expenseId,
      ...s
    }));

    const { error: splitsError } = await supabase
      .from('expense_splits')
      .insert(splitsToInsert);

    if (splitsError) throw splitsError;

    res.json({ expense, splits: splitsToInsert });
  } catch (err) {
    console.error('Update expense error:', err.message);
    res.status(400).json({ error: err.message || 'Failed to update expense' });
  }
});

// DELETE /api/expenses/:id -> soft delete
router.delete('/expenses/:id', async (req, res) => {
  const expenseId = req.params.id;

  try {
    const { error } = await supabase
      .from('expenses')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', expenseId);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error('Delete expense error:', err);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

module.exports = router;
