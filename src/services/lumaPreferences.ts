import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = 'lumap.lumaPreferences.v2'
const LEGACY_URLS_KEY = 'lumap.lumaSources.v1'

export const LUMA_INTERESTS = [
  { id: 'tech', label: 'Tech' },
  { id: 'ai', label: 'AI' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'food', label: 'Food' },
  { id: 'climate', label: 'Climate' },
  { id: 'wellness', label: 'Wellness' },
  { id: 'fitness', label: 'Fitness' },
] as const

export type LumaInterestId = (typeof LUMA_INTERESTS)[number]['id']

export type LumaPreferences = {
  profileUrl: string
  username: string | null
  displayName: string | null
  /** LinkedIn display name for CSV self-exclusion */
  linkedinName: string | null
  place: string
  interests: LumaInterestId[]
  linkedAt: string | null
}

const DEFAULTS: LumaPreferences = {
  profileUrl: '',
  username: null,
  displayName: null,
  linkedinName: null,
  place: 'berlin',
  interests: ['tech', 'ai'],
  linkedAt: null,
}

function normalizeProfileInput(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const u = new URL(trimmed)
      if (!/^(www\.)?(lu\.ma|luma\.com)$/i.test(u.hostname)) return trimmed
      return `https://lu.ma${u.pathname.replace(/\/$/, '')}`
    } catch {
      return trimmed
    }
  }
  const handle = trimmed.replace(/^@/, '')
  if (handle.startsWith('user/')) return `https://lu.ma/${handle}`
  return `https://lu.ma/user/${handle}`
}

export async function getLumaPreferences(): Promise<LumaPreferences> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<LumaPreferences>
      const interests = Array.isArray(parsed.interests)
        ? (parsed.interests.filter((id): id is LumaInterestId =>
            LUMA_INTERESTS.some((i) => i.id === id),
          ) as LumaInterestId[])
        : DEFAULTS.interests
      return {
        ...DEFAULTS,
        ...parsed,
        profileUrl: parsed.profileUrl ?? '',
        interests: interests.length ? interests : DEFAULTS.interests,
        place: (parsed.place ?? DEFAULTS.place).trim().toLowerCase() || 'berlin',
      }
    }
  } catch {
    // fall through
  }

  // One-time: drop legacy per-event URL list (no longer used).
  void AsyncStorage.removeItem(LEGACY_URLS_KEY)
  return { ...DEFAULTS }
}

export async function saveLumaPreferences(
  patch: Partial<LumaPreferences>,
): Promise<LumaPreferences> {
  const current = await getLumaPreferences()
  const next: LumaPreferences = {
    ...current,
    ...patch,
    profileUrl:
      patch.profileUrl != null
        ? normalizeProfileInput(patch.profileUrl)
        : current.profileUrl,
    place: (patch.place ?? current.place).trim().toLowerCase() || 'berlin',
    interests:
      patch.interests && patch.interests.length > 0
        ? patch.interests
        : current.interests,
  }
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

export function toggleInterest(
  current: LumaInterestId[],
  id: LumaInterestId,
): LumaInterestId[] {
  if (current.includes(id)) {
    const next = current.filter((x) => x !== id)
    return next.length ? next : current
  }
  return [...current, id]
}
