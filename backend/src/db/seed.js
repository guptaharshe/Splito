const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// All users to seed
const users = [
  { name: 'Admin', email: 'admin@splito.com', password: 'Admin@123', role: 'admin' },
  { name: 'Aisha', email: 'aisha@splito.com', password: 'Flat@123', role: 'member' },
  { name: 'Rohan', email: 'rohan@splito.com', password: 'Flat@123', role: 'member' },
  { name: 'Priya', email: 'priya@splito.com', password: 'Flat@123', role: 'member' },
  { name: 'Meera', email: 'meera@splito.com', password: 'Flat@123', role: 'member' },
  { name: 'Sam',   email: 'sam@splito.com',   password: 'Flat@123', role: 'member' },
  { name: 'Dev',   email: 'dev@splito.com',   password: 'Flat@123', role: 'member' },
];

// Membership dates for Flat 4B
const memberships = {
  'Aisha': { joined_at: '2026-02-01', left_at: null },
  'Rohan': { joined_at: '2026-02-01', left_at: null },
  'Priya': { joined_at: '2026-02-01', left_at: null },
  'Meera': { joined_at: '2026-02-01', left_at: '2026-03-31' },
  'Sam':   { joined_at: '2026-04-15', left_at: null },
  'Dev':   { joined_at: null, left_at: null },  // guest — no permanent membership
};

async function seed() {
  console.log('Starting seed...\n');

  const userIds = {};

  // Step 1: Create users in Supabase Auth + users table
  for (const user of users) {
    console.log(`Creating user: ${user.name} (${user.email})`);

    // Create in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
    });

    if (authError) {
      // If user already exists, fetch their ID
      if (authError.message.includes('already') || authError.status === 422) {
        console.log(`  Auth user already exists, fetching ID...`);
        const { data: listData } = await supabase.auth.admin.listUsers();
        const existing = listData.users.find(u => u.email === user.email);
        if (existing) {
          userIds[user.name] = existing.id;
        } else {
          console.error(`  Could not find existing user: ${user.email}`);
          continue;
        }
      } else {
        console.error(`  Auth error: ${authError.message}`);
        continue;
      }
    } else {
      userIds[user.name] = authData.user.id;
    }

    // Insert into users table
    const { error: dbError } = await supabase
      .from('users')
      .upsert({
        id: userIds[user.name],
        name: user.name,
        email: user.email,
        role: user.role,
      });

    if (dbError) {
      console.error(`  DB error: ${dbError.message}`);
    } else {
      console.log(`  ✓ Created: ${user.name} (${userIds[user.name]})`);
    }
  }

  // Step 2: Create the "Flat 4B" group
  console.log('\nCreating group: Flat 4B');
  const { data: groupData, error: groupError } = await supabase
    .from('groups')
    .insert({
      name: 'Flat 4B',
      description: 'Flatmates sharing expenses',
      created_by: userIds['Admin'],
    })
    .select()
    .single();

  if (groupError) {
    console.error(`  Group error: ${groupError.message}`);
    return;
  }

  const groupId = groupData.id;
  console.log(`  ✓ Created group: ${groupId}`);

  // Step 3: Add memberships
  console.log('\nAdding memberships...');
  for (const [name, dates] of Object.entries(memberships)) {
    if (!userIds[name]) {
      console.log(`  Skipping ${name} — no user ID`);
      continue;
    }

    // Skip Dev if no joined_at (guest, not a permanent member)
    if (!dates.joined_at) {
      console.log(`  Skipping ${name} — guest (no joined_at date)`);
      continue;
    }

    const { error: memberError } = await supabase
      .from('group_members')
      .insert({
        group_id: groupId,
        user_id: userIds[name],
        joined_at: dates.joined_at,
        left_at: dates.left_at,
      });

    if (memberError) {
      console.error(`  Membership error for ${name}: ${memberError.message}`);
    } else {
      const status = dates.left_at ? `joined ${dates.joined_at}, left ${dates.left_at}` : `joined ${dates.joined_at}`;
      console.log(`  ✓ ${name}: ${status}`);
    }
  }

  console.log('\n✓ Seed complete!');
}

seed().catch(console.error);
