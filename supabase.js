import { createClient } from '@supabase/supabase-js';

// Supabase configuration using environment variables
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Check if environment variables are set
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Supabase environment variables not found!');
  console.error('Please create a .env file with:');
  console.error('EXPO_PUBLIC_SUPABASE_URL=your-project-url');
  console.error('EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY); 