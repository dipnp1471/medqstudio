import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ielrtgjjkvmbnrdiyzkv.supabase.co';
const supabaseAnonKey = 'sb_publishable_GNxOjyHvIgNqVPVGEdsZMg_h3JuH15u';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error(error);
  } else {
    console.log('Sample question from Supabase:', JSON.stringify(data[0], null, 2));
  }
}

run();
