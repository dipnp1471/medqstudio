import { createClient } from '@supabase/supabase-js';
import { questions } from '../src/data/questions.js';

const supabaseUrl = 'https://ielrtgjjkvmbnrdiyzkv.supabase.co';
const supabaseAnonKey = 'sb_publishable_GNxOjyHvIgNqVPVGEdsZMg_h3JuH15u';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log(`Syncing ${questions.length} questions from questions.js to Supabase...`);
  
  // Format questions: ensure required fields are present
  const formattedQuestions = questions.map(q => ({
    id: q.id,
    type: q.type || 'SBA',
    stem: q.stem || '',
    options: q.options || [],
    correct: q.correct || null,
    explanation: q.explanation || '',
    topic: q.topic || '',
    subtopic: q.subtopic || '',
    blueprint_tag: q.blueprint_tag || '',
    clinical_area: q.clinical_area || '',
    status: q.status || 'Active',
    theme: q.theme || null,
    scenarios: q.scenarios || null,
    flags: q.flags || []
  }));

  const { error } = await supabase
    .from('questions')
    .upsert(formattedQuestions, { onConflict: 'id' });

  if (error) {
    console.error('Error syncing questions:', error);
  } else {
    console.log('Successfully synced all questions to Supabase!');
  }
}

run();
