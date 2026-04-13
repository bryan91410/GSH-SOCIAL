import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const SUPABASE_CONFIG_ERROR =
  'Variables Supabase manquantes: VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY'
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

function throwSupabaseConfigError() {
  throw new Error(SUPABASE_CONFIG_ERROR)
}

const throwingFn = new Proxy(function unavailableSupabaseClient() {}, {
  get() {
    return throwingFn
  },
  apply() {
    throwSupabaseConfigError()
  },
  construct() {
    throwSupabaseConfigError()
  }
})

const unavailableSupabase = new Proxy(
  {},
  {
    get() {
      return throwingFn
    }
  }
)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : unavailableSupabase
