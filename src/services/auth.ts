import { supabase } from './supabaseClient'

/** Ensures a session exists (anonymous) so RLS owner policies work. */
export async function ensureSession() {
  const { data: existing } = await supabase.auth.getSession()
  if (existing.session) return existing.session

  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) {
    console.warn('[auth] anonymous sign-in failed', error.message)
    return null
  }
  return data.session
}

export async function getAccessToken() {
  const session = await ensureSession()
  return session?.access_token ?? null
}
