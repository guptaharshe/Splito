require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function seed() {
  console.log('Starting seed process...');

  // 1. Wipe existing test data
  console.log('Cleaning up existing groups and expenses...');
  await supabase.from('expense_splits').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('expenses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('group_members').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('groups').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  const usersToCreate = [
    { email: 'aisha@splito.com', name: 'Aisha' },
    { email: 'rohan@splito.com', name: 'Rohan' },
    { email: 'priya@splito.com', name: 'Priya' },
    { email: 'meera@splito.com', name: 'Meera' },
    { email: 'dev@splito.com', name: 'Dev' },
    { email: 'sam@splito.com', name: 'Sam' }
  ];

  const createdUsers = {};

  for (const u of usersToCreate) {
    const { data: authData } = await supabase.auth.admin.listUsers();
    let authUser = authData.users.find(user => user.email === u.email);
    
    if (!authUser) {
      console.log(`Creating auth user: ${u.email}`);
      const { data: newAuthUser, error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: 'password123',
        email_confirm: true
      });
      if (error) throw error;
      authUser = newAuthUser.user;
    }

    // Upsert into public.users
    const { data: publicUser, error: publicError } = await supabase.from('users').upsert({
      id: authUser.id,
      email: u.email,
      name: u.name,
      role: 'member'
    }).select().single();
    if (publicError) throw publicError;

    createdUsers[u.name] = publicUser.id;
  }

  // 2. Create the Group
  console.log('Creating group...');
  const { data: group, error: groupError } = await supabase.from('groups').insert({
    name: 'Flat 4B',
    description: 'Flatmates Sharing Expenses',
    created_at: '2026-02-01T00:00:00Z'
  }).select().single();
  if (groupError) throw groupError;

  // 3. Add Members with specific timelines
  const memberships = [
    { user_id: createdUsers['Aisha'], group_id: group.id, joined_at: '2026-02-01' },
    { user_id: createdUsers['Rohan'], group_id: group.id, joined_at: '2026-02-01' },
    { user_id: createdUsers['Priya'], group_id: group.id, joined_at: '2026-02-01' },
    { user_id: createdUsers['Meera'], group_id: group.id, joined_at: '2026-02-01', left_at: '2026-03-31' },
    { user_id: createdUsers['Dev'], group_id: group.id, joined_at: '2026-03-08', left_at: '2026-03-12' },
    { user_id: createdUsers['Sam'], group_id: group.id, joined_at: '2026-04-08' }
  ];

  console.log('Adding members...');
  const { error: membersError } = await supabase.from('group_members').insert(memberships);
  if (membersError) throw membersError;

  console.log('✅ Database successfully seeded with Flatmates cohort!');
}

seed().catch(console.error);
