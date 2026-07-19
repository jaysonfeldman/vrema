import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? 'https://gdygbhgawxzxbctzmwzc.supabase.co';
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkeWdiaGdhd3h6eGJjdHptd3pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1NjMxNDQsImV4cCI6MjA1NzEzOTE0NH0.ggzhDIr2gZapwoYtbtP9S2fB6C8MpOezLkju4FJNd4M';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});
