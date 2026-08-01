import * as DocumentPicker from 'expo-document-picker'
import { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAppTheme } from '../context/AppModeContext'
import {
  countLinkedInContacts,
  importLinkedInCsv,
  listContactSharedEvents,
  refreshOverlaps,
  syncLumaFeed,
} from '../services/eventsApi'
import type { ContactSharedEventRow } from '../types'
import {
  getLumaPreferences,
  LUMA_INTERESTS,
  saveLumaPreferences,
  toggleInterest,
  type LumaInterestId,
  type LumaPreferences,
} from '../services/lumaPreferences'
import { fonts } from '../theme/tokens'

type Props = {
  onDataChanged?: () => void
  onClose?: () => void
  /** Extra bottom padding so content clears the tab bar. */
  bottomInset?: number
}

function SectionLabel({
  children,
  color,
}: {
  children: string
  color: string
}) {
  return (
    <Text
      className="mb-2"
      style={{
        fontFamily: fonts.uiBold,
        fontSize: 11,
        letterSpacing: 0.8,
        color,
        textTransform: 'uppercase',
      }}
    >
      {children}
    </Text>
  )
}

export function SettingsPanel({
  onDataChanged,
  onClose,
  bottomInset = 88,
}: Props) {
  const { theme } = useAppTheme()
  const insets = useSafeAreaInsets()
  const [prefs, setPrefs] = useState<LumaPreferences | null>(null)
  const [profileDraft, setProfileDraft] = useState('')
  const [placeDraft, setPlaceDraft] = useState('berlin')
  const [linkedinNameDraft, setLinkedinNameDraft] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [contactCount, setContactCount] = useState(0)
  const [topShared, setTopShared] = useState<ContactSharedEventRow[]>([])

  const refreshCount = useCallback(async () => {
    const [count, shared] = await Promise.all([
      countLinkedInContacts(),
      listContactSharedEvents(8),
    ])
    setContactCount(count)
    setTopShared(shared)
  }, [])

  useEffect(() => {
    void refreshCount()
    void (async () => {
      const saved = await getLumaPreferences()
      setPrefs(saved)
      setProfileDraft(saved.profileUrl)
      setPlaceDraft(saved.place)
      setLinkedinNameDraft(saved.linkedinName ?? '')
    })()
  }, [refreshCount])

  const run = async (fn: () => Promise<void>) => {
    setBusy(true)
    setStatus(null)
    try {
      await fn()
      onDataChanged?.()
      await refreshCount()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Fehler')
    } finally {
      setBusy(false)
    }
  }

  const interests = prefs?.interests ?? ['tech', 'ai']

  const onToggleInterest = (id: LumaInterestId) => {
    const next = toggleInterest(interests, id)
    setPrefs((prev) => (prev ? { ...prev, interests: next } : prev))
    void saveLumaPreferences({ interests: next })
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: insets.top + 12,
        paddingBottom: bottomInset + insets.bottom,
      }}
      style={{ backgroundColor: theme.bg }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="mb-6 flex-row items-center justify-between">
        <Text
          style={{
            fontFamily: fonts.display,
            fontSize: 24,
            color: theme.textPrimary,
          }}
        >
          Einstellungen
        </Text>
        {onClose ? (
          <Pressable onPress={onClose} hitSlop={12}>
            <Text
              style={{
                fontFamily: fonts.uiSemiBold,
                fontSize: 16,
                color: theme.accent,
              }}
            >
              Fertig
            </Text>
          </Pressable>
        ) : null}
      </View>

      {/* Luma */}
      <SectionLabel color={theme.textMuted}>Luma</SectionLabel>
      <Text
        className="mb-4"
        style={{
          fontFamily: fonts.ui,
          fontSize: 14,
          lineHeight: 21,
          color: theme.textBody,
        }}
      >
        Verknüpfe dein Luma-Profil. LuMap lädt dann öffentliche Events in
        deiner Stadt — gefiltert nach Interessen, auch ohne Anmeldung.
      </Text>

      <Text
        className="mb-2"
        style={{
          fontFamily: fonts.uiMedium,
          fontSize: 13,
          color: theme.textPrimary,
        }}
      >
        Profil-Link
      </Text>
      <TextInput
        value={profileDraft}
        onChangeText={setProfileDraft}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="off"
        placeholder="https://lu.ma/user/deinname"
        placeholderTextColor={theme.textFaint}
        className="mb-2 rounded-2xl px-4 py-3.5"
        style={{
          backgroundColor: theme.cardBg,
          borderWidth: 1,
          borderColor: theme.border,
          color: theme.textPrimary,
          fontFamily: fonts.ui,
          fontSize: 15,
        }}
      />
      {prefs?.username ? (
        <Text
          className="mb-3"
          style={{
            fontFamily: fonts.uiMedium,
            fontSize: 13,
            color: theme.accent,
          }}
        >
          Verbunden als @{prefs.username}
          {prefs.displayName ? ` · ${prefs.displayName}` : ''}
        </Text>
      ) : (
        <Text
          className="mb-3"
          style={{
            fontFamily: fonts.ui,
            fontSize: 12,
            color: theme.textMuted,
          }}
        >
          Öffne Luma → Profil → Link kopieren
        </Text>
      )}

      <Text
        className="mb-2"
        style={{
          fontFamily: fonts.uiMedium,
          fontSize: 13,
          color: theme.textPrimary,
        }}
      >
        Stadt
      </Text>
      <TextInput
        value={placeDraft}
        onChangeText={setPlaceDraft}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="berlin"
        placeholderTextColor={theme.textFaint}
        className="mb-4 rounded-2xl px-4 py-3.5"
        style={{
          backgroundColor: theme.cardBg,
          borderWidth: 1,
          borderColor: theme.border,
          color: theme.textPrimary,
          fontFamily: fonts.ui,
          fontSize: 15,
        }}
      />

      <Text
        className="mb-2"
        style={{
          fontFamily: fonts.uiMedium,
          fontSize: 13,
          color: theme.textPrimary,
        }}
      >
        Interessen
      </Text>
      <View className="mb-4 flex-row flex-wrap gap-2">
        {LUMA_INTERESTS.map((item) => {
          const selected = interests.includes(item.id)
          return (
            <Pressable
              key={item.id}
              onPress={() => onToggleInterest(item.id)}
              className="rounded-full px-3.5 py-2"
              style={{
                backgroundColor: selected ? theme.accent : theme.cardBg,
                borderWidth: 1,
                borderColor: selected ? theme.accent : theme.border,
              }}
            >
              <Text
                style={{
                  fontFamily: fonts.uiSemiBold,
                  fontSize: 13,
                  color: selected ? theme.accentInk : theme.textBody,
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          )
        })}
      </View>

      <Pressable
        disabled={busy || !profileDraft.trim()}
        className="mb-8 items-center rounded-2xl py-3.5"
        style={{
          backgroundColor: theme.accent,
          opacity: busy || !profileDraft.trim() ? 0.5 : 1,
        }}
        onPress={() =>
          void run(async () => {
            const saved = await saveLumaPreferences({
              profileUrl: profileDraft,
              place: placeDraft,
              interests,
            })
            const result = await syncLumaFeed(saved)
            const linked = await saveLumaPreferences({
              profileUrl: saved.profileUrl,
              place: saved.place,
              interests: saved.interests,
              username: result.profile?.username ?? saved.username,
              displayName: result.profile?.name ?? saved.displayName,
              linkedAt: new Date().toISOString(),
            })
            setPrefs(linked)
            setProfileDraft(linked.profileUrl)
            setPlaceDraft(linked.place)
            setStatus(
              result.profile?.username
                ? `@${result.profile.username} · ${result.upserted} Events · ${result.enriched ?? 0} Details`
                : `${result.upserted} Events · ${result.enriched ?? 0} Details`,
            )
          })
        }
      >
        <Text
          style={{
            fontFamily: fonts.uiBold,
            fontSize: 15,
            color: theme.accentInk,
          }}
        >
          Profil verknüpfen & syncen
        </Text>
      </Pressable>

      {/* LinkedIn */}
      <SectionLabel color={theme.textMuted}>LinkedIn</SectionLabel>
      <Text
        className="mb-3"
        style={{
          fontFamily: fonts.ui,
          fontSize: 14,
          lineHeight: 21,
          color: theme.textBody,
        }}
      >
        Connections.csv oder Invitations.csv — offizieller Datenexport, kein
        Scraping.
      </Text>
      <Text
        className="mb-2"
        style={{
          fontFamily: fonts.uiMedium,
          fontSize: 13,
          color: theme.textPrimary,
        }}
      >
        Dein LinkedIn-Name (optional)
      </Text>
      <TextInput
        value={linkedinNameDraft}
        onChangeText={setLinkedinNameDraft}
        autoCorrect={false}
        placeholder="Vor- und Nachname wie auf LinkedIn"
        placeholderTextColor={theme.textFaint}
        className="mb-3 rounded-2xl px-4 py-3.5"
        style={{
          backgroundColor: theme.cardBg,
          borderWidth: 1,
          borderColor: theme.border,
          color: theme.textPrimary,
          fontFamily: fonts.ui,
          fontSize: 15,
        }}
        onEndEditing={() => {
          void saveLumaPreferences({
            linkedinName: linkedinNameDraft.trim() || null,
          }).then(setPrefs)
        }}
      />
      <Text
        className="mb-3"
        style={{
          fontFamily: fonts.uiMedium,
          fontSize: 14,
          color: theme.textPrimary,
        }}
      >
        {contactCount} Kontakte importiert
      </Text>
      {topShared.length > 0 ? (
        <View className="mb-4">
          <Text
            className="mb-2"
            style={{
              fontFamily: fonts.ui,
              fontSize: 13,
              color: theme.textMuted,
            }}
          >
            Meiste gemeinsame Events
          </Text>
          {topShared.map((person) => (
            <View
              key={person.name_key || person.full_name}
              className="mb-1.5 flex-row items-center justify-between"
            >
              <Text
                numberOfLines={1}
                style={{
                  flex: 1,
                  marginRight: 12,
                  fontFamily: fonts.uiMedium,
                  fontSize: 14,
                  color: theme.textPrimary,
                }}
              >
                {person.full_name}
              </Text>
              <Text
                style={{
                  fontFamily: fonts.uiSemiBold,
                  fontSize: 13,
                  color: theme.accent,
                }}
              >
                {person.shared_events}×
              </Text>
            </View>
          ))}
        </View>
      ) : null}
      <Pressable
        disabled={busy}
        className="mb-1.5 items-center rounded-2xl py-3.5"
        style={{
          backgroundColor: theme.cardBg,
          borderWidth: 1,
          borderColor: theme.border,
        }}
        onPress={() =>
          void run(async () => {
            const picked = await DocumentPicker.getDocumentAsync({
              type: [
                'text/csv',
                'text/comma-separated-values',
                'text/plain',
                '*/*',
              ],
              copyToCacheDirectory: true,
            })
            if (picked.canceled || !picked.assets?.[0]) {
              setStatus('Abgebrochen')
              return
            }
            const asset = picked.assets[0]
            const res = await fetch(asset.uri)
            const csvText = await res.text()
            const linkedinName = linkedinNameDraft.trim() || null
            if (linkedinName !== (prefs?.linkedinName ?? null)) {
              await saveLumaPreferences({ linkedinName })
            }
            const result = await importLinkedInCsv(csvText, {
              selfNames: [
                linkedinName,
                prefs?.displayName,
              ].filter((n): n is string => Boolean(n?.trim())),
            })
            if (result.excluded_self && !linkedinName) {
              const pretty = result.excluded_self
                .split(' ')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ')
              await saveLumaPreferences({ linkedinName: pretty })
              setLinkedinNameDraft(pretty)
              setPrefs((prev) =>
                prev ? { ...prev, linkedinName: pretty } : prev,
              )
            }
            setStatus(
              `${result.imported} Kontakte · ${result.overlaps_updated} Overlaps`,
            )
          })
        }
      >
        <Text
          style={{
            fontFamily: fonts.uiSemiBold,
            fontSize: 15,
            color: theme.textPrimary,
          }}
        >
          CSV hochladen
        </Text>
      </Pressable>
      <Text
        className="mb-3"
        style={{
          fontFamily: fonts.ui,
          fontSize: 11,
          lineHeight: 16,
          color: theme.textFaint,
        }}
      >
        Dein Name wird beim Import übersprungen.
      </Text>
      <Pressable
        disabled={busy}
        className="mb-6 items-center rounded-2xl py-3.5"
        style={{
          backgroundColor: theme.cardBg,
          borderWidth: 1,
          borderColor: theme.border,
        }}
        onPress={() =>
          void run(async () => {
            const result = await refreshOverlaps()
            setStatus(`Overlaps: ${result.overlaps_updated}`)
          })
        }
      >
        <Text
          style={{
            fontFamily: fonts.uiSemiBold,
            fontSize: 15,
            color: theme.textPrimary,
          }}
        >
          Overlaps neu matchen
        </Text>
      </Pressable>

      {busy ? (
        <View className="mt-2 flex-row items-center gap-3">
          <ActivityIndicator color={theme.accent} />
          <Text
            style={{
              fontFamily: fonts.ui,
              fontSize: 14,
              color: theme.textMuted,
            }}
          >
            Synchronisiere…
          </Text>
        </View>
      ) : status ? (
        <Text
          style={{
            fontFamily: fonts.ui,
            fontSize: 14,
            lineHeight: 20,
            color: theme.textBody,
          }}
        >
          {status}
        </Text>
      ) : null}

      <Text
        className="mt-10"
        style={{
          fontFamily: fonts.ui,
          fontSize: 12,
          lineHeight: 18,
          color: theme.textFaint,
        }}
      >
        Namens-Matches mit LinkedIn sind Hinweise, keine verifizierten
        Identitäten.
      </Text>
    </ScrollView>
  )
}
