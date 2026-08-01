import type { DbEventRow, EventItem, EventOverlapRow } from '../types'
import { getAccessToken } from './auth'
import { supabase } from './supabaseClient'

const FUNCTIONS_BASE = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1`

function mapEvent(
  row: DbEventRow,
  overlap?: EventOverlapRow | null,
): EventItem {
  return {
    id: row.id,
    title: row.title,
    source_platform: row.source_platform,
    mode: row.mode,
    event_url: row.event_url,
    venue_name: row.venue_name,
    latitude: row.latitude,
    longitude: row.longitude,
    is_residential: row.is_residential,
    start_time: row.start_time,
    original_author_name: row.original_author_name,
    original_author_headline: row.original_author_headline,
    attendee_count: row.attendee_count,
    guest_list_public: row.guest_list_public,
    linkedin_match_count: overlap?.linkedin_match_count ?? 0,
    match_preview: overlap?.match_preview ?? [],
  }
}

export async function loadFeedEvents(): Promise<EventItem[]> {
  const { data: events, error } = await supabase
    .from('events')
    .select(
      'id, source_platform, mode, title, event_url, venue_name, latitude, longitude, is_residential, guest_list_public, attendee_count, start_time, original_author_name, original_author_headline',
    )
    .order('start_time', { ascending: true })

  if (error) {
    console.warn('[events] load failed', error.message)
    return []
  }

  const token = await getAccessToken()
  let overlaps: EventOverlapRow[] = []
  if (token) {
    const { data } = await supabase
      .from('event_overlaps')
      .select('event_id, linkedin_match_count, match_preview')
    overlaps = (data as EventOverlapRow[] | null) ?? []
  }

  const byEvent = new Map(overlaps.map((o) => [o.event_id, o]))
  return (events as DbEventRow[]).map((row) =>
    mapEvent(row, byEvent.get(row.id)),
  )
}

export async function fetchLumaEvent(eventUrl: string) {
  const token = await getAccessToken()
  const res = await fetch(`${FUNCTIONS_BASE}/fetch-luma-event`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ event_url: eventUrl, force: true }),
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.error ?? `fetch-luma-event failed (${res.status})`)
  }
  return json
}

export async function importLinkedInCsv(csvText: string) {
  const token = await getAccessToken()
  if (!token) {
    throw new Error('Login/session required for LinkedIn import')
  }
  const res = await fetch(`${FUNCTIONS_BASE}/import-linkedin-csv`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
    },
    body: JSON.stringify({ csvText }),
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.error ?? `import failed (${res.status})`)
  }
  return json as { imported: number; overlaps_updated: number }
}

export async function refreshOverlaps(eventId?: string) {
  const token = await getAccessToken()
  if (!token) throw new Error('Session required')
  const res = await fetch(`${FUNCTIONS_BASE}/match-overlaps`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
    },
    body: JSON.stringify({ event_id: eventId ?? null }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'match-overlaps failed')
  return json
}

export async function countLinkedInContacts() {
  const { count, error } = await supabase
    .from('linkedin_contacts')
    .select('*', { count: 'exact', head: true })
  if (error) return 0
  return count ?? 0
}
