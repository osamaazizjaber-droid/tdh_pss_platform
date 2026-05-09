// Supabase client configuration
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL     = import.meta.env.VITE_SUPABASE_URL     || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Check if credentials are configured
export const isSupabaseConfigured =
  SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY.length > 10

// Create a real client only when properly configured, otherwise a dummy stub
export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : createMockClient()

function createMockClient() {
  const stub = () => ({
    select:  () => stub(),
    insert:  () => stub(),
    update:  () => stub(),
    delete:  () => stub(),
    eq:      () => stub(),
    order:   () => stub(),
    single:  () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    then:    (fn) => Promise.resolve({ data: null, error: null }).then(fn),
  })
  return {
    from:  () => stub(),
    auth: {
      getSession:          () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange:   (cb) => { cb('SIGNED_OUT', null); return { data: { subscription: { unsubscribe: () => {} } } } },
      signInWithPassword:  () => Promise.resolve({ data: null, error: { message: 'Supabase not configured. Please add your credentials to the .env file.' } }),
      signOut:             () => Promise.resolve(),
    },
  }
}
