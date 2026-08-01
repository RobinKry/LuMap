import type { EventAttendeePreview, EventItem } from '../types'

const friends: EventAttendeePreview[] = [
  { id: 'f1', display_name: 'Mira', avatar_url: null },
  { id: 'f2', display_name: 'Jonas', avatar_url: null },
  { id: 'f3', display_name: 'Lea', avatar_url: null },
]

export type FeedEvent = EventItem & {
  friends?: EventAttendeePreview[]
  otherCount?: number
}

/** Mock feed until Luma / LinkedIn sync is wired. */
export const mockFeedEvents: FeedEvent[] = [
  {
    id: 'luma-1',
    title: 'AI Builders Meetup',
    source_platform: 'LUMA',
    mode: 'WORK',
    event_url: 'https://lu.ma/ai-builders-berlin',
    venue_name: 'Factory Berlin',
    latitude: 52.5311,
    longitude: 13.3842,
    is_residential: false,
    start_time: '2026-08-06T17:00:00Z',
    original_author_name: null,
    original_author_headline: null,
    friends: friends.slice(0, 2),
    otherCount: 4,
  },
  {
    id: 'li-1',
    title: 'Speaking at Climate Tech Summit',
    source_platform: 'LINKEDIN',
    mode: 'WORK',
    event_url: 'https://www.linkedin.com/feed/update/urn:li:activity:mock',
    venue_name: 'Station Berlin',
    latitude: 52.5074,
    longitude: 13.3676,
    is_residential: false,
    start_time: '2026-08-12T08:00:00Z',
    original_author_name: 'Sara Klein',
    original_author_headline: 'Partner @ Green Ventures',
    friends: [friends[0]],
    otherCount: 2,
  },
  {
    id: 'party-1',
    title: 'Rooftop Summer Session',
    source_platform: 'PARTIFUL',
    mode: 'PARTY',
    event_url: 'https://partiful.com/e/rooftop-summer',
    venue_name: 'Apt 4B · Kreuzberg',
    latitude: 52.4982,
    longitude: 13.418,
    is_residential: true,
    start_time: '2026-08-09T20:00:00Z',
    original_author_name: null,
    original_author_headline: null,
    friends: friends,
    otherCount: 11,
  },
  {
    id: 'party-2',
    title: 'Vinyl & Natural Wine',
    source_platform: 'PARTIFUL',
    mode: 'PARTY',
    event_url: 'https://partiful.com/e/vinyl-wine',
    venue_name: 'OHM Berlin',
    latitude: 52.5112,
    longitude: 13.4271,
    is_residential: false,
    start_time: '2026-08-10T19:00:00Z',
    original_author_name: null,
    original_author_headline: null,
    friends: friends.slice(1),
    otherCount: 6,
  },
]
