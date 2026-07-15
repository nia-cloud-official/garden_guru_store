import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Server-only client using the service role key. This bypasses Row Level
// Security and must NEVER be imported into client components or exposed
// to the browser. Only import this inside API routes / server actions.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase service role environment variables');
}

export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
