import type {
  ContactSharedEventRow,
  DbEventRow,
  EventAttendeePreview,
  EventItem,
  EventOverlapRow,
  MatchPersonPreview,
} from '../types'
import { getAccessToken } from './auth'
import {
  getLumaPreferences,
  type LumaPreferences,
} from './lumaPreferences'
import { supabase } from './supabaseClient'

const FUNCTIONS_BASE = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1`

function parseMatchDetails(raw: unknown): MatchPersonPreview[] {
  if (!Array.isArray(raw)) return []
  const out: MatchPersonPreview[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const row = item as Record<string, unknown>
    const fullName =
      typeof row.full_name === 'string' ? row.full_name.trim() : ''
    if (!fullName) continue
    const shared =
      typeof row.shared_events === 'number' && Number.isFinite(row.shared_events)
        ? Math.max(0, Math.floor(row.shared_events))
        : 1
    out.push({
      full_name: fullName,
      name_key: typeof row.name_key === 'string' ? row.name_key : undefined,
      shared_events: shared,
    })
  }
  return out
}

function mapGuests(
  row: DbEventRow,
  sharedByKey: Map<string, number>,
  sharedByName: Map<string, number>,
): EventAttendeePreview[] {
  const raw = row.event_guests ?? []
  return raw.map((g, i) => {
    const key = (g.name_key ?? '').trim().toLowerCase()
    const name = g.display_name.trim().toLowerCase()
    const shared =
      (key ? sharedByKey.get(key) : undefined) ??
      (name ? sharedByName.get(name) : undefined)
    return {
      id: `${row.id}-${g.name_key ?? i}-${g.display_name}`,
      display_name: g.display_name,
      avatar_url: g.avatar_url,
      ...(shared && shared > 0 ? { shared_events: shared } : {}),
    }
  })
}

function mapEvent(
  row: DbEventRow,
  overlap?: EventOverlapRow | null,
  sharedByKey: Map<string, number> = new Map(),
  sharedByName: Map<string, number> = new Map(),
): EventItem {
  const guests = mapGuests(row, sharedByKey, sharedByName)
  const matchPeople =
    overlap?.match_details && overlap.match_details.length > 0
      ? overlap.match_details
      : (overlap?.match_preview ?? []).map((full_name) => ({
          full_name,
          shared_events:
            sharedByName.get(full_name.trim().toLowerCase()) ?? 1,
        }))
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
    cover_url: row.cover_url ?? null,
    description: row.description ?? null,
    host_name: row.host_name ?? null,
    attendee_count: row.attendee_count,
    guest_list_public: row.guest_list_public,
    linkedin_match_count: overlap?.linkedin_match_count ?? 0,
    match_preview: overlap?.match_preview ?? [],
    match_people: matchPeople,
    guests,
  }
}

export async function loadFeedEvents(): Promise<EventItem[]> {
  const { data: events, error } = await supabase
    .from('events')
    .select(
      `id, source_platform, mode, title, event_url, venue_name, latitude, longitude,
       is_residential, guest_list_public, attendee_count, start_time,
       original_author_name, original_author_headline, cover_url, description, host_name,
       event_guests(display_name, avatar_url, name_key)`,
    )
    .order('start_time', { ascending: true })

  if (error) {
    console.warn('[events] load failed', error.message)
    return []
  }

  const token = await getAccessToken()
  let overlaps: EventOverlapRow[] = []
  const sharedByKey = new Map<string, number>()
  const sharedByName = new Map<string, number>()

  if (token) {
    const [{ data: overlapRows }, shared] = await Promise.all([
      supabase
        .from('event_overlaps')
        .select('event_id, linkedin_match_count, match_preview, match_details'),
      listContactSharedEvents(50),
    ])

    overlaps = ((overlapRows as Array<Record<string, unknown>> | null) ?? []).map(
      (row) => ({
        event_id: String(row.event_id),
        linkedin_match_count: Number(row.linkedin_match_count) || 0,
        match_preview: (row.match_preview as string[] | null) ?? [],
        match_details: parseMatchDetails(row.match_details),
      }),
    )

    for (const person of shared) {
      sharedByKey.set(person.name_key, person.shared_events)
      sharedByName.set(person.full_name.trim().toLowerCase(), person.shared_events)
    }
  }

  const byEvent = new Map(overlaps.map((o) => [o.event_id, o]))
  return (events as DbEventRow[]).map((row) =>
    mapEvent(row, byEvent.get(row.id), sharedByKey, sharedByName),
  )
}

export type LumaSyncResult = {
  discovered: number
  upserted: number
  enriched?: number
  guests_written?: number
  profile: {
    username: string | null
    name: string | null
    user_api_id: string | null
    avatar_url?: string | null
    bio?: string | null
  } | null
  place: { slug: string; name: string }
  interests: string[]
  sources?: Array<{ source: string; count: number }>
}

/** Sync public Luma feed from linked profile + interests + city; enrich guests. */
export async function syncLumaFeed(
  prefs?: Partial<LumaPreferences> | null,
): Promise<LumaSyncResult> {
  const saved = prefs
    ? { ...(await getLumaPreferences()), ...prefs }
    : await getLumaPreferences()
  const token = await getAccessToken()
  const res = await fetch(`${FUNCTIONS_BASE}/discover-luma-events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      profile_url: saved.profileUrl || null,
      place: saved.place || 'berlin',
      interests: saved.interests,
      limit: 20,
      enrich: true,
    }),
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.error ?? `Luma-Sync fehlgeschlagen (${res.status})`)
  }

  // Refresh LinkedIn overlaps after new guests land.
  if (token) {
    try {
      await refreshOverlaps()
    } catch (error) {
      console.warn(
        '[luma] overlap refresh skipped',
        error instanceof Error ? error.message : error,
      )
    }
  }

  return json as LumaSyncResult
}

export async function importLinkedInCsv(
  csvText: string,
  options?: { selfName?: string | null; selfNames?: string[] },
) {
  const token = await getAccessToken()
  if (!token) {
    throw new Error('Login/session required for LinkedIn import')
  }
  const selfNames = [
    ...(options?.selfNames ?? []),
    ...(options?.selfName ? [options.selfName] : []),
  ]
    .map((n) => n.trim())
    .filter(Boolean)
  const res = await fetch(`${FUNCTIONS_BASE}/import-linkedin-csv`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
    },
    body: JSON.stringify({
      csvText,
      selfName: selfNames[0] ?? '',
      selfNames,
    }),
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.error ?? `import failed (${res.status})`)
  }
  return json as {
    imported: number
    overlaps_updated: number
    excluded_self?: string | null
  }
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

/** Contacts who appear on ≥1 synced event guest list, ranked by shared count. */
export async function listContactSharedEvents(
  limit = 12,
): Promise<ContactSharedEventRow[]> {
  const token = await getAccessToken()
  if (!token) return []
  const { data, error } = await supabase.rpc('list_contact_shared_events', {
    p_limit: limit,
  })
  if (error) {
    console.warn('[linkedin] shared events lookup failed', error.message)
    return []
  }
  return ((data as ContactSharedEventRow[] | null) ?? []).filter(
    (row) => row.full_name && row.shared_events > 0,
  )
}
