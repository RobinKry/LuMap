import type { LumaEvent } from '../types/event'

/** Placeholder-Events – echte Luma-Daten kommen später. */
export const mockEvents: LumaEvent[] = [
  {
    id: '1',
    title: 'Founders Breakfast Berlin',
    host: 'Startup Club',
    startsAt: '2026-08-05T08:30:00+02:00',
    venue: 'Café am Moritzplatz',
    city: 'Berlin',
    lat: 52.5034,
    lng: 13.4105,
    overlap: { attendees: 48, pastEventMatches: 6, linkedInContacts: 3 },
  },
  {
    id: '2',
    title: 'AI Builders Meetup',
    host: 'ML Berlin',
    startsAt: '2026-08-06T19:00:00+02:00',
    venue: 'Factory Berlin',
    city: 'Berlin',
    lat: 52.5311,
    lng: 13.3842,
    overlap: { attendees: 120, pastEventMatches: 11, linkedInContacts: 8 },
  },
  {
    id: '3',
    title: 'Design Critique Night',
    host: 'Product Design Circle',
    startsAt: '2026-08-07T18:30:00+02:00',
    venue: 'Betahaus',
    city: 'Berlin',
    lat: 52.4968,
    lng: 13.4195,
    overlap: { attendees: 32, pastEventMatches: 4, linkedInContacts: 2 },
  },
  {
    id: '4',
    title: 'Climate Tech Salon',
    host: 'Green Ventures',
    startsAt: '2026-08-08T17:00:00+02:00',
    venue: 'Impact Hub',
    city: 'Berlin',
    lat: 52.5208,
    lng: 13.4094,
    overlap: { attendees: 65, pastEventMatches: 2, linkedInContacts: 5 },
  },
]
