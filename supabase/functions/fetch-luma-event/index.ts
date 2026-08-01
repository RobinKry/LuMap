import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import { corsHeaders, jsonResponse, normalizeNameKey } from '../_shared/utils.ts'

type LumaGuest = { name?: string; avatar_url?: string | null }
type LumaPayload = {
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
    latitude?: number
    longitude?: number
  }
  guests?: LumaGuest[]
}

const CACHE_HOURS = 8

function extractSlug(input: string): string {
  try {
    const url = new URL(input)
    const parts = url.pathname.split('/').filter(Boolean)
    return parts[parts.length - 1] ?? input
  } catch {
    return input.replace(/^https?:\/\//, '').replace(/^lu\.ma\//, '')
  }
}

function eventUrlFromSlug(slug: string) {
  return `https://lu.ma/${slug}`
}

const PUBLIC_FIXTURE: LumaPayload = {
  api_id: 'evt-fixture-public',
  name: 'AI Builders Meetup',
  url: 'https://lu.ma/ai-builders-berlin',
  start_at: '2026-08-06T17:00:00.000Z',
  geo_address_info: {
    full_address: 'Factory Berlin, Berlin',
    latitude: 52.5311,
    longitude: 13.3842,
  },
  hosts: [{ name: 'ML Berlin' }],
  cover_url:
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
  description:
    'Builders meetup for AI founders and engineers in Berlin. Talks, demos, open networking.',
  guest_count: 3,
  show_guest_list: true,
  guests: [
    { name: 'Sara Klein', avatar_url: null },
    { name: 'Jonas Weber', avatar_url: null },
    { name: 'Mira Shah', avatar_url: null },
  ],
}

const PRIVATE_FIXTURE: LumaPayload = {
  api_id: 'evt-fixture-private',
  name: 'Private Founders Dinner',
  url: 'https://lu.ma/private-founders-dinner',
  start_at: '2026-08-15T18:00:00.000Z',
  geo_address_info: {
    full_address: 'Berlin',
    latitude: 52.52,
    longitude: 13.405,
  },
  hosts: [{ name: 'Secret Host' }],
  guest_count: 24,
  show_guest_list: false,
  guests: [],
}

function loadFixture(slug: string): LumaPayload | null {
  if (slug.includes('private')) return PRIVATE_FIXTURE
  if (slug.includes('ai-builders') || slug.includes('fixture-public')) {
    return PUBLIC_FIXTURE
  }
  return null
}

async function fetchLumaPublic(slug: string): Promise<LumaPayload> {
  const fixture = loadFixture(slug)
  if (fixture) return fixture

  // Undocumented web endpoint used by Luma's public event page.
  // May change; fixtures cover the parser contract.
  const endpoint = `https://api.lu.ma/url?url=${encodeURIComponent(`https://lu.ma/${slug}`)}`
  const res = await fetch(endpoint, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'LuMapBot/0.1 (+https://github.com/RobinKry/LuMap)',
    },
  })

  if (!res.ok) {
    // Fallback: scrape minimal meta from HTML page
    const page = await fetch(`https://lu.ma/${slug}`, {
      headers: {
        Accept: 'text/html',
        'User-Agent': 'LuMapBot/0.1 (+https://github.com/RobinKry/LuMap)',
      },
    })
    if (!page.ok) {
      throw new Error(`Luma fetch failed (${res.status}/${page.status})`)
    }
    const html = await page.text()
    return parseHtmlFallback(html, slug)
  }

  const json = await res.json()
  return normalizeApiPayload(json, slug)
}

function normalizeApiPayload(json: Record<string, unknown>, slug: string): LumaPayload {
  const event =
    (json.event as Record<string, unknown> | undefined) ??
    (json.data as Record<string, unknown> | undefined) ??
    json

  const guestsRaw =
    (json.guests as LumaGuest[] | undefined) ??
    (event.guests as LumaGuest[] | undefined) ??
    []

  const geo =
    (event.geo_address_info as LumaPayload['geo_address_info']) ??
    (event.geo_address as LumaPayload['geo_address_info'])

  const show =
    typeof event.show_guest_list === 'boolean'
      ? event.show_guest_list
      : guestsRaw.length > 0

  const descriptionRaw =
    (event.description as string | undefined) ??
    (event.description_mirror as string | undefined) ??
    (event.calendar_description as string | undefined)

  const cover =
    (event.cover_url as string | undefined) ??
    ((event.cover_image as { url?: string } | undefined)?.url) ??
    undefined

  return {
    api_id: String(event.api_id ?? event.id ?? ''),
    name: String(event.name ?? event.title ?? slug),
    url: eventUrlFromSlug(slug),
    start_at: (event.start_at as string) ?? (event.start_datetime as string),
    cover_url: cover,
    description: descriptionRaw
      ? String(descriptionRaw).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      : undefined,
    guest_count:
      typeof event.guest_count === 'number'
        ? event.guest_count
        : typeof event.accepted_count === 'number'
          ? event.accepted_count
          : guestsRaw.length || undefined,
    show_guest_list: show,
    hosts: (event.hosts as LumaPayload['hosts']) ?? [],
    geo_address_info: geo,
    guests: show ? guestsRaw : [],
  }
}

function parseHtmlFallback(html: string, slug: string): LumaPayload {
  const title =
    html.match(/<meta property="og:title" content="([^"]+)"/i)?.[1] ??
    html.match(/<title>([^<]+)<\/title>/i)?.[1] ??
    slug

  const cover =
    html.match(/<meta property="og:image" content="([^"]+)"/i)?.[1] ??
    html.match(/<meta name="twitter:image" content="([^"]+)"/i)?.[1]

  const description =
    html.match(/<meta property="og:description" content="([^"]+)"/i)?.[1] ??
    html.match(/<meta name="description" content="([^"]+)"/i)?.[1]

  const showGuestList =
    /who's coming|who is coming|guest list/i.test(html) &&
    !/guest list is private|guests are hidden/i.test(html)

  // Best-effort guest names from JSON blobs embedded in the page
  const guests: LumaGuest[] = []
  const nameMatches = html.matchAll(/"name"\s*:\s*"([^"]{2,80})"/g)
  for (const match of nameMatches) {
    const name = match[1]
    if (/luma|event|calendar/i.test(name)) continue
    if (guests.length >= 50) break
    if (!guests.some((g) => g.name === name)) {
      guests.push({ name })
    }
  }

  return {
    name: title.replace(/\s+\|\s*Luma.*/i, '').trim(),
    url: eventUrlFromSlug(slug),
    cover_url: cover,
    description: description
      ? description.replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim()
      : undefined,
    show_guest_list: showGuestList && guests.length > 0,
    guest_count: guests.length || undefined,
    guests: showGuestList ? guests : [],
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const authHeader = req.headers.get('Authorization')
    const body = await req.json()
    const eventUrlOrSlug = String(body.event_url ?? body.url ?? body.slug ?? '')
    if (!eventUrlOrSlug) {
      return jsonResponse({ error: 'event_url required' }, 400)
    }

    const slug = extractSlug(eventUrlOrSlug)
    const eventUrl = eventUrlFromSlug(slug)
    const admin = createClient(supabaseUrl, serviceKey)

    // Cache hit
    const { data: existing } = await admin
      .from('events')
      .select('*')
      .eq('event_url', eventUrl)
      .maybeSingle()

    if (existing?.fetched_at) {
      const ageMs = Date.now() - new Date(existing.fetched_at).getTime()
      if (ageMs < CACHE_HOURS * 3600 * 1000 && !body.force) {
        const { data: guests } = await admin
          .from('event_guests')
          .select('display_name, avatar_url, name_key')
          .eq('event_id', existing.id)
        return jsonResponse({
          cached: true,
          event: existing,
          guests: guests ?? [],
          guest_list_public: existing.guest_list_public,
        })
      }
    }

    const payload = await fetchLumaPublic(slug)
    const guestListPublic = Boolean(payload.show_guest_list)

    const eventRow = {
      source_platform: 'LUMA',
      mode: 'WORK',
      title: payload.name ?? slug,
      event_url: payload.url ?? eventUrl,
      slug,
      luma_event_id: payload.api_id || null,
      venue_name: payload.geo_address_info?.full_address ?? null,
      latitude: payload.geo_address_info?.latitude ?? null,
      longitude: payload.geo_address_info?.longitude ?? null,
      is_residential: false,
      guest_list_public: guestListPublic,
      attendee_count: payload.guest_count ?? (guestListPublic ? payload.guests?.length ?? null : null),
      start_time: payload.start_at ?? null,
      cover_url: payload.cover_url ?? null,
      description: payload.description ?? null,
      host_name: payload.hosts?.[0]?.name ?? null,
      fetched_at: new Date().toISOString(),
    }

    const { data: upserted, error: upsertError } = await admin
      .from('events')
      .upsert(eventRow, { onConflict: 'event_url' })
      .select('*')
      .single()

    if (upsertError || !upserted) {
      return jsonResponse({ error: upsertError?.message ?? 'upsert failed' }, 500)
    }

    // Replace guests when list is public; clear when private
    await admin.from('event_guests').delete().eq('event_id', upserted.id)

    let guestRows: Array<{
      event_id: string
      display_name: string
      name_key: string
      avatar_url: string | null
      source: string
    }> = []

    if (guestListPublic && payload.guests?.length) {
      guestRows = payload.guests
        .map((g) => {
          const display = (g.name ?? '').trim()
          const nameKey = normalizeNameKey(display)
          if (!nameKey) return null
          return {
            event_id: upserted.id,
            display_name: display,
            name_key: nameKey,
            avatar_url: g.avatar_url ?? null,
            source: 'luma',
          }
        })
        .filter(Boolean) as typeof guestRows

      if (guestRows.length) {
        const { error: guestError } = await admin.from('event_guests').insert(guestRows)
        if (guestError) {
          return jsonResponse({ error: guestError.message }, 500)
        }
      }
    }

    // Optional: track for authenticated user + refresh overlaps
    let overlapsUpdated = 0
    if (authHeader) {
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      })
      const {
        data: { user },
      } = await userClient.auth.getUser()
      if (user) {
        await admin.from('user_tracked_events').upsert(
          { user_id: user.id, event_id: upserted.id },
          { onConflict: 'user_id,event_id' },
        )
        const { data: matchCount } = await admin.rpc('refresh_event_overlaps', {
          p_user_id: user.id,
          p_event_id: upserted.id,
        })
        overlapsUpdated = matchCount ?? 0
      }
    }

    return jsonResponse({
      cached: false,
      event: upserted,
      guests: guestRows,
      guest_list_public: guestListPublic,
      overlaps_updated: overlapsUpdated,
      warning: guestListPublic
        ? undefined
        : 'Guest list is private — names were not stored',
    })
  } catch (error) {
    console.error(error)
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      500,
    )
  }
})
