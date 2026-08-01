import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'
import { LM } from '../theme/tokens'

export type ModeTheme = {
  bg: string
  accent: string
  accentSoft: string
  accentInk: string
  cardBg: string
  sheetBg: string
  chrome: string
  textPrimary: string
  textBody: string
  textMuted: string
  textFaint: string
  border: string
}

/** Single light theme — no WORK/PARTY modes. */
export const APP_THEME: ModeTheme = {
  bg: LM.paperMist,
  accent: LM.sky500,
  accentSoft: LM.sky100,
  accentInk: LM.ink900,
  cardBg: LM.paperWhite,
  sheetBg: 'rgba(255,255,255,0.92)',
  chrome: 'rgba(255,255,255,0.78)',
  textPrimary: LM.ink900,
  textBody: LM.ink700,
  textMuted: LM.ink500,
  textFaint: LM.ink300,
  border: LM.alpha10,
}

type ThemeContextValue = {
  theme: ModeTheme
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => ({ theme: APP_THEME }), [])
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  )
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useAppTheme must be used within AppThemeProvider')
  }
  return ctx
}

/** @deprecated use useAppTheme — kept for gradual rename */
export function useAppMode() {
  return useAppTheme()
}

/** @deprecated use AppThemeProvider */
export const AppModeProvider = AppThemeProvider
