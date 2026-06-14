require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function run() {
  const { error } = await supabase.rpc('exec_sql', { query: "ALTER TABLE import_anomalies ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'BLOCKING';" });
  if (error) console.error("Error with exec_sql (maybe it doesn't exist):", error);
  else console.log("Success with exec_sql");
}
run();
