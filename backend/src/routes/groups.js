const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Require authentication for all group routes
router.use(authMiddleware);

// GET /api/groups - list all groups for user
router.get('/', async (req, res) => {
  try {
    // If admin, they might need to see all groups.
    // For members, only groups they belong to.
    let query = supabase.from('groups').select(`
      id, name, description, created_at,
      group_members!inner(user_id)
    `).is('deleted_at', null);

    if (req.user.role !== 'admin') {
      query = query.eq('group_members.user_id', req.user.id);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Remove the nested group_members array to clean up response and add memberCount
    const formattedData = data.map(g => {
      const { group_members, ...groupData } = g;
      return {
        ...groupData,
        memberCount: group_members ? group_members.length : 0
      };
    });

    res.json({ groups: formattedData });
  } catch (err) {
    console.error('Fetch groups error:', err);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// GET /api/groups/:id - group detail + members
router.get('/:id', async (req, res) => {
  const groupId = req.params.id;

  try {
    // 1. Get Group Details
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .is('deleted_at', null)
      .single();

    if (groupError || !group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // 2. Get Members details
    const { data: members, error: membersError } = await supabase
      .from('group_members')
      .select(`
        joined_at, left_at,
        users (id, name, email, role)
      `)
      .eq('group_id', groupId);

    if (membersError) throw membersError;

    // Flatten user info
    const formattedMembers = members.map(m => ({
      id: m.users.id,
      name: m.users.name,
      email: m.users.email,
      role: m.users.role,
      joined_at: m.joined_at,
      left_at: m.left_at
    }));

    res.json({
      group,
      members: formattedMembers
    });
  } catch (err) {
    console.error('Fetch group details error:', err);
    res.status(500).json({ error: 'Failed to fetch group details' });
  }
});

// POST /api/groups - create group
router.post('/', async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Group name is required' });
  }

  try {
    const { data, error } = await supabase
      .from('groups')
      .insert({
        name,
        description,
        created_by: req.user.id
      })
      .select()
      .single();

    if (error) throw error;

    // Add creator as member automatically
    await supabase.from('group_members').insert({
      group_id: data.id,
      user_id: req.user.id,
      joined_at: new Date().toISOString().split('T')[0] // YYYY-MM-DD
    });

    res.status(201).json({ group: data });
  } catch (err) {
    console.error('Create group error:', err);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// POST /api/groups/:id/members - add member
router.post('/:id/members', async (req, res) => {
  const groupId = req.params.id;
  const { user_id, joined_at } = req.body;

  if (!user_id || !joined_at) {
    return res.status(400).json({ error: 'user_id and joined_at are required' });
  }

  try {
    const { data, error } = await supabase
      .from('group_members')
      .insert({
        group_id: groupId,
        user_id,
        joined_at,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ member: data });
  } catch (err) {
    console.error('Add member error:', err);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// PUT /api/groups/:id/members/:uid - update member (set left_at)
router.put('/:id/members/:uid', async (req, res) => {
  const { id: groupId, uid: userId } = req.params;
  const { left_at } = req.body;

  try {
    const { data, error } = await supabase
      .from('group_members')
      .update({ left_at })
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ member: data });
  } catch (err) {
    console.error('Update member error:', err);
    res.status(500).json({ error: 'Failed to update member' });
  }
});

module.exports = router;
