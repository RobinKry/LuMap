import type { AppMode, EventItem, EventSource } from '../types'

const LUMA_URL_RE = /https?:\/\/(www\.)?lu\.ma\/[a-zA-Z0-9_-]+/g
const PARTIFUL_URL_RE = /https?:\/\/(www\.)?partiful\.com\/e\/[a-zA-Z0-9_-]+/g

const RESIDENTIAL_KEYWORDS = ['apt', 'unit', 'suite', 'resi', 'partiful']

type CalendarPayloadItem = {
  id?: string
  title?: string
  summary?: string
  description?: string
  location?: string
  url?: string
  start?: string | { dateTime?: string; date?: string }
  latitude?: number
  longitude?: number
}

function isResidentialLocation(location: string | undefined): boolean {
  if (!location) return false
  const lower = location.toLowerCase()
  return RESIDENTIAL_KEYWORDS.some((keyword) => lower.includes(keyword))
}

function extractStartTime(item: CalendarPayloadItem): string | null {
  if (typeof item.start === 'string') return item.start
  return item.start?.dateTime ?? item.start?.date ?? null
}

function makeId(source: EventSource, url: string, fallback: string) {
  return `${source.toLowerCase()}:${url || fallback}`
}

function buildEvent(params: {
  title: string
  source: EventSource
  mode: AppMode
  url: string
  venueName: string | null
  latitude?: number | null
  longitude?: number | null
  startTime: string | null
  isResidential: boolean
}): EventItem {
  return {
    id: makeId(params.source, params.url, params.title),
    title: params.title,
    source_platform: params.source,
    mode: params.mode,
    event_url: params.url,
    venue_name: params.venueName,
    latitude: params.latitude ?? null,
    longitude: params.longitude ?? null,
    is_residential: params.isResidential,
    start_time: params.startTime,
    original_author_name: null,
    original_author_headline: null,
  }
}

/** Parses calendar / clipboard payloads for Luma + Partiful links. */
export function parseCalendarPayload(items: any[]): EventItem[] {
  const events: EventItem[] = []

  for (const raw of items as CalendarPayloadItem[]) {
    const haystack = [
      raw.url,
      raw.title,
      raw.summary,
      raw.description,
      raw.location,
    ]
      .filter(Boolean)
      .join('\n')

    const lumaMatches = haystack.match(LUMA_URL_RE) ?? []
    for (const url of new Set(lumaMatches)) {
      events.push(
        buildEvent({
          title: raw.title ?? raw.summary ?? 'Luma Event',
          source: 'LUMA',
          mode: 'WORK',
          url,
          venueName: raw.location ?? null,
          latitude: raw.latitude,
          longitude: raw.longitude,
          startTime: extractStartTime(raw),
          isResidential: isResidentialLocation(raw.location),
        }),
      )
    }

    const partifulMatches = haystack.match(PARTIFUL_URL_RE) ?? []
    for (const url of new Set(partifulMatches)) {
      const residential =
        isResidentialLocation(raw.location) ||
        isResidentialLocation(haystack)
      events.push(
        buildEvent({
          title: raw.title ?? raw.summary ?? 'Partiful Event',
          source: 'PARTIFUL',
          mode: 'PARTY',
          url,
          venueName: raw.location ?? null,
          latitude: raw.latitude,
          longitude: raw.longitude,
          startTime: extractStartTime(raw),
          isResidential: residential,
        }),
      )
    }

    // Explicit URL field without body match
    if (raw.url && lumaMatches.length === 0 && partifulMatches.length === 0) {
      const lumaOnly = raw.url.match(/https?:\/\/(www\.)?lu\.ma\/[a-zA-Z0-9_-]+/)
      if (lumaOnly?.[0]) {
        events.push(
          buildEvent({
            title: raw.title ?? raw.summary ?? 'Luma Event',
            source: 'LUMA',
            mode: 'WORK',
            url: lumaOnly[0],
            venueName: raw.location ?? null,
            latitude: raw.latitude,
            longitude: raw.longitude,
            startTime: extractStartTime(raw),
            isResidential: isResidentialLocation(raw.location),
          }),
        )
      }
    }
  }

  return events
}
