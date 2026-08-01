import type { EventItem } from '../types'

const EVENT_INTENT_RE =
  /\b(attending|speaking at|conference|meetup|happy hour|summit)\b/i

/** Extracts WORK-mode event signals from a LinkedIn post. */
export function parseLinkedInPost(
  postText: string,
  authorName: string,
  authorHeadline: string,
  postUrl: string,
): EventItem | null {
  if (!EVENT_INTENT_RE.test(postText)) {
    return null
  }

  const titleMatch = postText
    .split(/[\n.!?]/)
    .map((part) => part.trim())
    .find((part) => EVENT_INTENT_RE.test(part))

  return {
    id: `linkedin:${postUrl || authorName}:${titleMatch?.slice(0, 40) ?? 'event'}`,
    title: titleMatch || `Event mentioned by ${authorName}`,
    source_platform: 'LINKEDIN',
    mode: 'WORK',
    event_url: postUrl,
    venue_name: null,
    latitude: null,
    longitude: null,
    is_residential: false,
    start_time: null,
    original_author_name: authorName,
    original_author_headline: authorHeadline,
  }
}
