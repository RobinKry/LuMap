export type AppMode = 'WORK' | 'PARTY'

export type EventSource = 'LUMA' | 'PARTIFUL' | 'LINKEDIN' | 'EVENTBRITE'

export interface EventAttendeePreview {
  id: string
  display_name: string
  avatar_url: string | null
}

export interface EventItem {
  id: string
  title: string
  source_platform: EventSource
  mode: AppMode
  event_url: string
  venue_name: string | null
  latitude: number | null
  longitude: number | null
  is_residential: boolean
  start_time: string | null
  original_author_name: string | null
  original_author_headline: string | null
  cover_url?: string | null
  description?: string | null
  host_name?: string | null
  attendee_count?: number | null
  guest_list_public?: boolean
  linkedin_match_count?: number
  match_preview?: string[]
  /** Public guest list when available */
  guests?: EventAttendeePreview[]
}

export interface UserProfile {
  id: string
  display_name: string
  avatar_url: string | null
  linkedin_url: string | null
  created_at: string
}

export interface Friendship {
  id: string
  user_id: string
  friend_id: string
  status: 'pending' | 'accepted' | 'blocked'
  created_at: string
}

export interface DbEventGuestRow {
  display_name: string
  avatar_url: string | null
  name_key?: string
}

export interface DbEventRow {
  id: string
  source_platform: EventSource
  mode: AppMode
  title: string
  event_url: string
  venue_name: string | null
  latitude: number | null
  longitude: number | null
  is_residential: boolean
  guest_list_public: boolean
  attendee_count: number | null
  start_time: string | null
  original_author_name: string | null
  original_author_headline: string | null
  cover_url?: string | null
  description?: string | null
  host_name?: string | null
  event_guests?: DbEventGuestRow[] | null
}

export interface EventOverlapRow {
  event_id: string
  linkedin_match_count: number
  match_preview: string[] | null
}
