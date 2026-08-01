// Mock feed — mirrors src/data/mockFeedEvents.ts verbatim, plus the enriched
// fields the Supabase view supplies (attendee_count, linkedin_match_count…).
const friends = [
  { id: 'f1', display_name: 'Mira', avatar_url: null },
  { id: 'f2', display_name: 'Jonas', avatar_url: null },
  { id: 'f3', display_name: 'Lea', avatar_url: null },
];

const feedEvents = [
  {
    id: 'luma-1', title: 'AI Builders Meetup', source_platform: 'LUMA', mode: 'WORK',
    venue_name: 'Factory Berlin', is_residential: false, x: 30, y: 20,
    attendee_count: 128, linkedin_match_count: 9, match_preview: ['Sara Klein', 'Tom Reuter', 'Nina Fuchs'],
    guest_list_public: true, friends: friends.slice(0, 2), otherCount: 4,
    original_author_name: null, original_author_headline: null,
  },
  {
    id: 'li-1', title: 'Speaking at Climate Tech Summit', source_platform: 'LINKEDIN', mode: 'WORK',
    venue_name: 'Station Berlin', is_residential: false, x: 68, y: 33,
    attendee_count: 340, linkedin_match_count: 14, match_preview: ['Sara Klein', 'Paul Adam'],
    guest_list_public: false, friends: [friends[0]], otherCount: 2,
    original_author_name: 'Sara Klein', original_author_headline: 'Partner @ Green Ventures',
  },
  {
    id: 'party-1', title: 'Rooftop Summer Session', source_platform: 'PARTIFUL', mode: 'PARTY',
    venue_name: 'Apt 4B · Kreuzberg', is_residential: true, x: 46, y: 31,
    attendee_count: 38, linkedin_match_count: 2, match_preview: ['Mira K.', 'Jonas B.'],
    guest_list_public: true, friends: friends, otherCount: 11,
    original_author_name: null, original_author_headline: null,
  },
  {
    id: 'party-2', title: 'Vinyl & Natural Wine', source_platform: 'PARTIFUL', mode: 'PARTY',
    venue_name: 'OHM Berlin', is_residential: false, x: 74, y: 17,
    attendee_count: 62, linkedin_match_count: 3, match_preview: ['Lea M.'],
    guest_list_public: true, friends: friends.slice(1), otherCount: 6,
    original_author_name: null, original_author_headline: null,
  },
  {
    id: 'party-3', title: 'Basement Techno · Guestlist', source_platform: 'PARTIFUL', mode: 'PARTY',
    venue_name: 'Neukölln', is_residential: true, x: 20, y: 36,
    attendee_count: 91, linkedin_match_count: 0, match_preview: [],
    guest_list_public: false, friends: [friends[2]], otherCount: 19,
    original_author_name: null, original_author_headline: null,
  },
  {
    id: 'luma-2', title: 'Founders Coffee · Mitte', source_platform: 'LUMA', mode: 'WORK',
    venue_name: 'Oslo Kaffebar', is_residential: false, x: 22, y: 20,
    attendee_count: 24, linkedin_match_count: 6, match_preview: ['Tom Reuter'],
    guest_list_public: true, friends: [friends[1]], otherCount: 1,
    original_author_name: null, original_author_headline: null,
  },
];

Object.assign(window, { feedEvents });
