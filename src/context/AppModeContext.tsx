import * as Haptics from 'expo-haptics'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AppMode } from '../types'

export type ModeTheme = {
  bg: string
  accent: string
  cardBg: string
  mapStyle: string
}

export const MODE_THEMES: Record<AppMode, ModeTheme> = {
  PARTY: {
    bg: '#0D0D12',
    accent: '#C0FF00',
    cardBg: 'rgba(25, 25, 35, 0.85)',
    mapStyle: 'mapbox://styles/mapbox/dark-v11',
  },
  WORK: {
    bg: '#12161A',
    accent: '#0052FF',
    cardBg: 'rgba(30, 38, 46, 0.90)',
    mapStyle: 'mapbox://styles/mapbox/navigation-night-v1',
  },
}

type AppModeContextValue = {
  mode: AppMode
  theme: ModeTheme
  toggleMode: () => void
  setMode: (mode: AppMode) => void
}

const AppModeContext = createContext<AppModeContextValue | null>(null)

export function AppModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppMode>('PARTY')

  const setMode = useCallback((next: AppMode) => {
    setModeState((current) => {
      if (current === next) return current
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
      return next
    })
  }, [])

  const toggleMode = useCallback(() => {
    setModeState((current) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
      return current === 'PARTY' ? 'WORK' : 'PARTY'
    })
  }, [])

  const value = useMemo(
    () => ({
      mode,
      theme: MODE_THEMES[mode],
      toggleMode,
      setMode,
    }),
    [mode, toggleMode, setMode],
  )

  return (
    <AppModeContext.Provider value={value}>{children}</AppModeContext.Provider>
  )
}

export function useAppMode() {
  const ctx = useContext(AppModeContext)
  if (!ctx) {
    throw new Error('useAppMode must be used within AppModeProvider')
  }
  return ctx
}
