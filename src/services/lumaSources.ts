import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from './supabaseClient'

const STORAGE_KEY = 'lumap.lumaSources.v1'

function normalizeUrl(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return null
  try {
    const parsed = new URL(trimmed)
    if (!/^(www\.)?lu\.ma$/i.test(parsed.hostname)) return null
    return `https://lu.ma${parsed.pathname.replace(/\/$/, '')}`
  } catch {
    return null
  }
}

export async function getSavedLumaUrls(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return [
      ...new Set(
        parsed
          .filter((u): u is string => typeof u === 'string')
          .map(normalizeUrl)
          .filter((u): u is string => Boolean(u)),
      ),
    ]
  } catch {
    return []
  }
}

export async function saveLumaUrl(url: string): Promise<string[]> {
  const normalized = normalizeUrl(url)
  const existing = await getSavedLumaUrls()
  if (!normalized) return existing
  if (existing.includes(normalized)) return existing
  const next = [...existing, normalized]
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

/** Seed local sources from events already in Supabase (one-time bootstrap). */
export async function resolveLumaSources(): Promise<string[]> {
  const saved = await getSavedLumaUrls()
  if (saved.length > 0) return saved

  const { data, error } = await supabase
    .from('events')
    .select('event_url')
    .eq('source_platform', 'LUMA')
    .not('event_url', 'is', null)

  if (error || !data?.length) return []

  const urls = [
    ...new Set(
      data
        .map((row) => normalizeUrl(String(row.event_url ?? '')))
        .filter((u): u is string => Boolean(u)),
    ),
  ]
  if (urls.length > 0) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(urls))
  }
  return urls
}
