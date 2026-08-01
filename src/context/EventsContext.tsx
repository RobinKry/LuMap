import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { ensureSession } from '../services/auth'
import { loadFeedEvents, syncLumaFeed } from '../services/eventsApi'
import { getLumaPreferences } from '../services/lumaPreferences'
import type { EventItem } from '../types'

type EventsContextValue = {
  events: EventItem[]
  selected: EventItem | null
  setSelected: (event: EventItem | null) => void
  refresh: () => Promise<void>
}

const EventsContext = createContext<EventsContextValue | null>(null)

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<EventItem[]>([])
  const [selected, setSelected] = useState<EventItem | null>(null)

  const refresh = useCallback(async () => {
    const rows = await loadFeedEvents()
    setEvents(rows)
  }, [])

  useEffect(() => {
    void (async () => {
      await ensureSession()
      await refresh()
      const prefs = await getLumaPreferences()
      try {
        await syncLumaFeed(prefs)
        await refresh()
      } catch (error) {
        console.warn(
          '[luma] sync failed',
          error instanceof Error ? error.message : error,
        )
      }
    })()
  }, [refresh])

  const value = useMemo(
    () => ({ events, selected, setSelected, refresh }),
    [events, selected, refresh],
  )

  return (
    <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
  )
}

export function useEvents() {
  const ctx = useContext(EventsContext)
  if (!ctx) {
    throw new Error('useEvents must be used within EventsProvider')
  }
  return ctx
}
