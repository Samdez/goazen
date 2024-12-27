import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
    reconnectAfterMs: (retries: number) => {
      // Exponential backoff for reconnection attempts
      return Math.min(1000 + retries * 1000, 10000)
    },
    timeout: 30000,
  },
  global: {
    headers: {
      'x-connection-retry': '3',
      'x-connection-timeout': '30000',
    },
  },
})
