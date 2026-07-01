import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ielrtgjjkvmbnrdiyzkv.supabase.co';
const supabaseAnonKey = 'sb_publishable_GNxOjyHvIgNqVPVGEdsZMg_h3JuH15u';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, count, error } = await supabase
    .from('questions')
    .select('*', { count: 'exact' });
    
  if (error) {
    console.error(error);
  } else {
    console.log(`Supabase has ${count} questions in the database.`);
    if (data && data.length > 0) {
      console.log('Sample question ID:', data[0].id);
    }
  }
}

run();
