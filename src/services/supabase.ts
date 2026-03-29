import { createClient } from '@supabase/supabase-js';

let _supabase: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (_supabase) return _supabase;

  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url === 'YOUR_SUPABASE_URL') {
    return null;
  }

  _supabase = createClient(url, key);
  return _supabase;
}
