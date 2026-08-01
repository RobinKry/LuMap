import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import { corsHeaders, jsonResponse, normalizeNameKey } from '../_shared/utils.ts'

type DiscoverEvent = {
  api_id?: string
  calendar_api_id?: string
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

type PlaceInfo = {
  slug: string
  latitude: number
  longitude: number
  name?: string
}

type ProfileInfo = {
  username: string | null
  name: string | null
  user_api_id: string | null
  avatar_url: string | null
  bio: string | null
  calendar_ids: string[]
}

type LumaGuest = { name?: string; avatar_url?: string | null }

const DEFAULT_PLACE = 'berlin'
const DEFAULT_LIMIT = 20
const MAX_INTERESTS = 8
const MAX_ENRICH = 12

const KNOWN_INTERESTS = new Set([
  'tech',
  'ai',
  'crypto',
  'food',
  'climate',
  'wellness',
  'fitness',
])

const UA = 'LuMapBot/0.1 (+https://github.com/RobinKry/LuMap)'

function eventUrlFromSlug(slug: string) {
  return `https://lu.ma/${slug}`
}

function extractSlug(input: string): string {
  try {
    const url = new URL(input.startsWith('http') ? input : `https://lu.ma/${input}`)
    const parts = url.pathname.split('/').filter(Boolean)
    return parts[parts.length - 1] ?? input
  } catch {
    return input.replace(/^https?:\/\//, '').replace(/^(lu\.ma|luma\.com)\//, '')
  }
}

function extractCalendarIds(text: string): string[] {
  return [...new Set(text.match(/cal-[A-Za-z0-9]+/g) ?? [])]
}

async function resolvePlace(placeSlug: string): Promise<PlaceInfo> {
  const slug = placeSlug.trim().toLowerCase() || DEFAULT_PLACE
  const page = await fetch(`https://luma.com/${slug}`, {
    headers: { 'User-Agent': UA },
    redirect: 'follow',
  })
  if (!page.ok) {
    return { slug: DEFAULT_PLACE, latitude: 52.52, longitude: 13.405, name: 'Berlin' }
  }
  const html = await page.text()
  const match = html.match(
    /<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s,
  )
  if (!match) {
    return { slug, latitude: 52.52, longitude: 13.405 }
  }
  try {
    const next = JSON.parse(match[1])
    const init = next?.props?.pageProps?.initialData
    if (init?.kind === 'discover-place' && init?.data?.place) {
      const place = init.data.place
      return {
        slug,
        latitude: Number(place.coordinate?.latitude ?? 52.52),
        longitude: Number(place.coordinate?.longitude ?? 13.405),
        name: place.name ?? slug,
      }
    }
  } catch {
    // ignore
  }
  return { slug, latitude: 52.52, longitude: 13.405 }
}

async function resolveProfile(profileUrl: string | null): Promise<ProfileInfo | null> {
  if (!profileUrl?.trim()) return null
  let url = profileUrl.trim()
  if (!/^https?:\/\//i.test(url)) {
    url = url.startsWith('user/')
      ? `https://lu.ma/${url}`
      : `https://lu.ma/user/${url.replace(/^@/, '')}`
  }
  const page = await fetch(url, {
    headers: { 'User-Agent': UA },
    redirect: 'follow',
  })
  if (!page.ok) {
    throw new Error('Luma-Profil nicht gefunden — prüfe den Link (lu.ma/user/…)')
  }
  const html = await page.text()
  const match = html.match(
    /<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s,
  )
  if (!match) throw new Error('Luma-Profil konnte nicht gelesen werden')
  const next = JSON.parse(match[1])
  const data = next?.props?.pageProps?.initialData
  const user = data?.user
  if (!user?.username) {
    throw new Error('Kein öffentliches Luma-Profil unter diesem Link')
  }
  return {
    username: user.username ?? null,
    name: user.name ?? null,
    user_api_id: user.api_id ?? null,
    avatar_url: user.avatar_url ?? null,
    bio: user.bio_short ?? user.bio ?? null,
    calendar_ids: extractCalendarIds(html),
  }
}

async function fetchDiscover(params: {
  slug: string
  latitude?: number
  longitude?: number
  limit?: number
}): Promise<DiscoverEntry[]> {
  const limit = Math.min(Math.max(params.limit ?? DEFAULT_LIMIT, 1), 40)
  const qs = new URLSearchParams()
  qs.set('pagination_limit', String(limit))
  qs.set('slug', params.slug)
  if (
    params.latitude != null &&
    params.longitude != null &&
    Number.isFinite(params.latitude) &&
    Number.isFinite(params.longitude)
  ) {
    qs.set('latitude', String(params.latitude))
    qs.set('longitude', String(params.longitude))
  }

  const endpoint = `https://api.luma.com/discover/get-paginated-events?${qs}`
  const res = await fetch(endpoint, {
    headers: { Accept: 'application/json', 'User-Agent': UA },
  })
  if (!res.ok) return []
  const json = (await res.json()) as { entries?: DiscoverEntry[] }
  return Array.isArray(json.entries) ? json.entries : []
}

async function fetchCalendarItems(calendarApiId: string, limit: number) {
  const qs = new URLSearchParams({
    calendar_api_id: calendarApiId,
    period: 'future',
    pagination_limit: String(limit),
  })
  const res = await fetch(`https://api.luma.com/calendar/get-items?${qs}`, {
    headers: { Accept: 'application/json', 'User-Agent': UA },
  })
  if (!res.ok) return []
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
    calendar_api_id: event.calendar_api_id ?? null,
  }
}

function normalizeInterests(raw: unknown): string[] {
  if (!Array.isArray(raw)) return ['tech', 'ai']
  const cleaned = raw
    .filter((x): x is string => typeof x === 'string')
    .map((x) => x.trim().toLowerCase())
    .filter((x) => KNOWN_INTERESTS.has(x))
  const unique = [...new Set(cleaned)].slice(0, MAX_INTERESTS)
  return unique.length ? unique : ['tech', 'ai']
}

async function scrapeEventDetail(slug: string): Promise<{
  cover_url?: string
  description?: string
  guest_count?: number
  show_guest_list: boolean
  guests: LumaGuest[]
  host_name?: string
  venue_name?: string
  latitude?: number
  longitude?: number
  start_at?: string
} | null> {
  // Prefer HTML page — api.lu.ma/url is flaky for many public events.
  const page = await fetch(`https://lu.ma/${slug}`, {
    headers: { Accept: 'text/html', 'User-Agent': UA },
    redirect: 'follow',
  })
  if (!page.ok) return null
  const html = await page.text()

  const cover =
    html.match(/<meta property="og:image" content="([^"]+)"/i)?.[1] ??
    undefined
  const description =
    html.match(/<meta property="og:description" content="([^"]+)"/i)?.[1]
      ?.replace(/&amp;/g, '&')
      .replace(/&#39;/g, "'")
      .trim() ?? undefined

  const showGuestList =
    /who's coming|who is coming|guest list/i.test(html) &&
    !/guest list is private|guests are hidden/i.test(html)

  const guests: LumaGuest[] = []
  if (showGuestList) {
    for (const match of html.matchAll(/"name"\s*:\s*"([^"]{2,80})"/g)) {
      const name = match[1]
      if (/luma|event|calendar|discover/i.test(name)) continue
      if (guests.length >= 40) break
      if (!guests.some((g) => g.name === name)) guests.push({ name })
    }
  }

  // Prefer explicit Luma counts embedded in page JSON over scraped list length.
  const guestCountMatch = html.match(/"guest_count"\s*:\s*(\d+)/)
  const acceptedCountMatch = html.match(/"accepted_count"\s*:\s*(\d+)/)
  const guestCountFromJson = guestCountMatch
    ? Number(guestCountMatch[1])
    : acceptedCountMatch
      ? Number(acceptedCountMatch[1])
      : undefined

  let latitude: number | undefined
  let longitude: number | undefined
  const latM = html.match(/"latitude"\s*:\s*(-?\d+\.?\d*)/)
  const lngM = html.match(/"longitude"\s*:\s*(-?\d+\.?\d*)/)
  if (latM && lngM) {
    latitude = Number(latM[1])
    longitude = Number(lngM[1])
  }

  const start_at = html.match(/"start_at"\s*:\s*"([^"]+)"/)?.[1]
  const host_name = html.match(/"hosts"\s*:\s*\[\s*\{[^}]*"name"\s*:\s*"([^"]+)"/)?.[1]
  const venue_name =
    html.match(/"full_address"\s*:\s*"([^"]+)"/)?.[1] ??
    html.match(/"city_state"\s*:\s*"([^"]+)"/)?.[1]

  return {
    cover_url: cover,
    description,
    guest_count:
      guestCountFromJson ?? (guests.length > 0 ? guests.length : undefined),
    show_guest_list: showGuestList && guests.length > 0,
    guests: showGuestList ? guests : [],
    host_name,
    venue_name,
    latitude,
    longitude,
    start_at,
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
    const placeSlug = String(body.place ?? body.slug ?? DEFAULT_PLACE)
    const interests = normalizeInterests(body.interests)
    const limit = Number(body.limit ?? DEFAULT_LIMIT)
    const enrich = body.enrich !== false
    const profileUrl =
      typeof body.profile_url === 'string'
        ? body.profile_url
        : typeof body.luma_profile === 'string'
          ? body.luma_profile
          : null
    const calendarIdsInput = Array.isArray(body.calendar_ids)
      ? body.calendar_ids.filter((x: unknown): x is string => typeof x === 'string')
      : []

    const profile = await resolveProfile(profileUrl)
    const place = await resolvePlace(placeSlug)

    const buckets: Array<{ source: string; entries: DiscoverEntry[] }> = []
    const calendarIds = new Set<string>([
      ...calendarIdsInput,
      ...(profile?.calendar_ids ?? []),
    ])

    buckets.push({
      source: `place:${place.slug}`,
      entries: await fetchDiscover({ slug: place.slug, limit }),
    })

    for (const interest of interests) {
      buckets.push({
        source: `interest:${interest}`,
        entries: await fetchDiscover({
          slug: interest,
          latitude: place.latitude,
          longitude: place.longitude,
          limit,
        }),
      })
    }

    // Collect calendars seen in discover results, then pull their future items.
    for (const bucket of buckets) {
      for (const entry of bucket.entries) {
        const cal = entry.event?.calendar_api_id
        if (cal && /^cal-[A-Za-z0-9]+$/.test(cal)) calendarIds.add(cal)
      }
    }

    for (const calId of [...calendarIds].slice(0, 8)) {
      buckets.push({
        source: `calendar:${calId}`,
        entries: await fetchCalendarItems(calId, limit),
      })
    }

    const byUrl = new Map<string, NonNullable<ReturnType<typeof mapEntry>>>()
    for (const bucket of buckets) {
      for (const entry of bucket.entries) {
        const row = mapEntry(entry)
        if (!row) continue
        byUrl.set(row.event_url, row)
      }
    }

    let upserted = 0
    const upsertedRows: Array<NonNullable<ReturnType<typeof mapEntry>>> = []
    for (const row of byUrl.values()) {
      const { calendar_api_id: _cal, ...dbRow } = row
      const { error } = await admin
        .from('events')
        .upsert(dbRow, { onConflict: 'event_url' })
      if (!error) {
        upserted += 1
        upsertedRows.push(row)
      } else console.error('upsert', row.event_url, error.message)
    }

    let enriched = 0
    let guests_written = 0
    if (enrich) {
      const toEnrich = upsertedRows
        .filter((r) => r.latitude != null && r.longitude != null)
        .slice(0, MAX_ENRICH)

      for (const row of toEnrich) {
        try {
          const detail = await scrapeEventDetail(row.slug)
          if (!detail) continue

          const { data: existing } = await admin
            .from('events')
            .select('id')
            .eq('event_url', row.event_url)
            .maybeSingle()
          if (!existing?.id) continue

          await admin
            .from('events')
            .update({
              cover_url: detail.cover_url ?? row.cover_url,
              description: detail.description ?? row.description,
              host_name: detail.host_name ?? row.host_name,
              venue_name: detail.venue_name ?? row.venue_name,
              latitude: detail.latitude ?? row.latitude,
              longitude: detail.longitude ?? row.longitude,
              start_time: detail.start_at ?? row.start_time,
              guest_list_public: detail.show_guest_list,
              attendee_count: detail.guest_count ?? row.attendee_count,
              fetched_at: new Date().toISOString(),
            })
            .eq('id', existing.id)

          await admin.from('event_guests').delete().eq('event_id', existing.id)
          if (detail.show_guest_list && detail.guests.length) {
            const guestRows = detail.guests
              .map((g) => {
                const display = (g.name ?? '').trim()
                const nameKey = normalizeNameKey(display)
                if (!nameKey) return null
                return {
                  event_id: existing.id,
                  display_name: display,
                  name_key: nameKey,
                  avatar_url: g.avatar_url ?? null,
                  source: 'luma',
                }
              })
              .filter(Boolean)
            if (guestRows.length) {
              await admin.from('event_guests').insert(guestRows)
              guests_written += guestRows.length
            }
          }
          enriched += 1
        } catch (err) {
          console.error('enrich failed', row.slug, err)
        }
      }
    }

    return jsonResponse({
      profile: profile
        ? {
            username: profile.username,
            name: profile.name,
            user_api_id: profile.user_api_id,
            avatar_url: profile.avatar_url,
            bio: profile.bio,
          }
        : null,
      place: {
        slug: place.slug,
        name: place.name ?? place.slug,
        latitude: place.latitude,
        longitude: place.longitude,
      },
      interests,
      discovered: byUrl.size,
      upserted,
      enriched,
      guests_written,
      calendars_used: [...calendarIds].slice(0, 8),
      sources: buckets.map((b) => ({
        source: b.source,
        count: b.entries.length,
      })),
    })
  } catch (error) {
    console.error(error)
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      500,
    )
  }
})
