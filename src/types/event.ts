export type EventOverlap = {
  attendees: number
  pastEventMatches: number
  linkedInContacts: number
}

export type LumaEvent = {
  id: string
  title: string
  host: string
  startsAt: string
  venue: string
  city: string
  lat: number
  lng: number
  overlap: EventOverlap
}
