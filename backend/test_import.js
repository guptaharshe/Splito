require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { parseCSV, detectAnomalies } = require('./src/services/importService');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function run() {
  const usersRes = await supabase.from('users').select('id, name');
  const knownUsers = usersRes.data;
  
  const mRes = await supabase.from('group_members').select('user_id, joined_at, left_at').eq('group_id', 'ceebfe07-b2e1-4c12-a7f4-d5cf202722b5'); // Assuming Flat 4B
  const members = mRes.data || [];
  
  const usersWithTimeline = knownUsers.map(u => {
    const mem = members.find(m => m.user_id === u.id);
    return { ...u, joined_at: mem?.joined_at, left_at: mem?.left_at };
  });

  const rows = await parseCSV('uploads/1781446317438-514072970.csv');
  console.log("Parsed rows count:", rows.length);
  
  const { cleanRows, anomalies } = detectAnomalies(rows, usersWithTimeline);
  console.log("Anomalies count:", anomalies.length);
}
run();
