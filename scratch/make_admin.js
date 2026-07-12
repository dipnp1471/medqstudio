/* global process */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ielrtgjjkvmbnrdiyzkv.supabase.co';
const supabaseAnonKey = 'sb_publishable_GNxOjyHvIgNqVPVGEdsZMg_h3JuH15u';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const emailArg = process.argv[2];

  if (!emailArg) {
    console.log('Usage: node scratch/make_admin.js <user_email>');
    console.log('\nCurrent users in database:');
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('email, alias, role');
    
    if (fetchError) {
      console.error('Error fetching users:', fetchError);
    } else {
      console.table(users);
    }
    return;
  }

  const emailLower = emailArg.trim().toLowerCase();
  console.log(`Attempting to make user "${emailLower}" an admin...`);

  const { data: updatedUser, error: updateError } = await supabase
    .from('users')
    .update({ role: 'admin' })
    .eq('email', emailLower)
    .select();

  if (updateError) {
    console.error('Error updating user role:', updateError);
  } else if (!updatedUser || updatedUser.length === 0) {
    console.log(`No user found with email "${emailLower}". Make sure they have logged in/registered first.`);
  } else {
    console.log(`Success! Updated user:`, updatedUser[0]);
  }
}

run();
