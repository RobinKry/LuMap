#!/usr/bin/env -S deno run
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import { corsHeaders, jsonResponse } from '../_shared/utils.ts'

type DiscoverEvent = {
  api_id?: string
  name?: string
  url?: string
  start_at?: string
  cover_url?: string
  description?: string
  guest_count?: number
  show_guest_list?: boolean
  hosts?: Array<{ name?: string }>
  geo_address_info?: {
    full_address?: string
    city_state?: string
    city?: string
    latitude?: number
    longitude?: number
  }
  coordinate?: { latitude?: number; longitude?: number }
}

type DiscoverEntry = {
  event?: DiscoverEvent
  api_id?: string
}

const DEFAULT_PLACE = 'berlin'
const DEFAULT_LIMIT = 30

function eventUrlFromSlug(slug: string) {
  return `https://lu.ma/${slug}`
}

function extractSlug(input: string): string {
  try {
    const url = new URL(input.startsWith('http') ? input : `https://lu.ma/${input}`)
    const parts = url.pathname.split('/').filter(Boolean)
    return parts[parts.length - 1] ?? input
  } catch {
    return input.replace(/^https?:\/\//, '').replace(/^lu\.ma\//, '')
  }
}

async function fetchDiscover(params: {
  place?: string
  latitude?: number
  longitude?: number
  limit?: number
}): Promise<DiscoverEntry[]> {
  const limit = Math.min(Math.max(params.limit ?? DEFAULT_LIMIT, 1), 50)
  const qs = new URLSearchParams()
  qs.set('pagination_limit', String(limit))

  if (
    params.latitude != null &&
    params.longitude != null &&
    Number.isFinite(params.latitude) &&
    Number.isFinite(params.longitude)
  ) {
    // Interest/geo discover around a point (public events, no RSVP required).
    qs.set('slug', 'tech')
    qs.set('latitude', String(params.latitude))
    qs.set('longitude', String(params.longitude))
  } else {
    qs.set('slug', params.place?.trim() || DEFAULT_PLACE)
  }

  const endpoint = `https://api.luma.com/discover/get-paginated-events?${qs}`
  const res = await fetch(endpoint, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'LuMapBot/0.1 (+https://github.com/RobinKry/LuMap)',
    },
  })
  if (!res.ok) {
    throw new Error(`Luma discover failed (${res.status})`)
  }
  const json = (await res.json()) as { entries?: DiscoverEntry[] }
  return Array.isArray(json.entries) ? json.entries : []
}

function mapEntry(entry: DiscoverEntry) {
  const event = entry.event
  if (!event?.name) return null

  const rawUrl = event.url ?? entry.api_id ?? event.api_id
  if (!rawUrl) return null
  const slug = extractSlug(String(rawUrl))
  const eventUrl = eventUrlFromSlug(slug)

  const lat =
    event.coordinate?.latitude ?? event.geo_address_info?.latitude ?? null
  const lng =
    event.coordinate?.longitude ?? event.geo_address_info?.longitude ?? null

  const venue =
    event.geo_address_info?.full_address ??
    event.geo_address_info?.city_state ??
    event.geo_address_info?.city ??
    null

  return {
    source_platform: 'LUMA' as const,
    // DB column still requires a value; UI no longer surfaces modes.
    mode: 'WORK' as const,
    title: event.name,
    event_url: eventUrl,
    slug,
    luma_event_id: event.api_id ?? entry.api_id ?? null,
    venue_name: venue,
    latitude: lat,
    longitude: lng,
    is_residential: false,
    guest_list_public: Boolean(event.show_guest_list),
    attendee_count: event.guest_count ?? null,
    start_time: event.start_at ?? null,
    cover_url: event.cover_url ?? null,
    description: event.description ?? null,
    host_name: event.hosts?.[0]?.name ?? null,
    fetched_at: new Date().toISOString(),
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const admin = createClient(supabaseUrl, serviceKey)

    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {}
    const place = String(body.place ?? body.slug ?? DEFAULT_PLACE)
    const latitude =
      body.latitude != null ? Number(body.latitude) : undefined
    const longitude =
      body.longitude != null ? Number(body.longitude) : undefined
    const limit =
      body.limit != null ? Number(body.limit) : DEFAULT_LIMIT

    const entries = await fetchDiscover({
      place,
      latitude,
      longitude,
      limit,
    })

    const rows = entries
      .map(mapEntry)
      .filter((row): row is NonNullable<typeof row> => Boolean(row))

    let upserted = 0
    for (const row of rows) {
      const { error } = await admin
        .from('events')
        .upsert(row, { onConflict: 'event_url' })
      if (!error) upserted += 1
      else console.error('upsert', row.event_url, error.message)
    }

    return jsonResponse({
      place,
      discovered: rows.length,
      upserted,
      // Discover is public — not limited to events the user RSVP'd to.
      note: 'Public Luma discover feed (no registration required)',
    })
  } catch (error) {
    console.error(error)
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      500,
    )
  }
})
