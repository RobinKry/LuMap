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
import { useAppTheme } from '../context/AppModeContext'
import {
  countLinkedInContacts,
  discoverLumaEvents,
  fetchLumaEvent,
  importLinkedInCsv,
  refreshOverlaps,
} from '../services/eventsApi'
import { getSavedLumaUrls, saveLumaUrl } from '../services/lumaSources'
import { fonts } from '../theme/tokens'

type Props = {
  onDataChanged?: () => void
  onClose?: () => void
}

export function SettingsPanel({ onDataChanged, onClose }: Props) {
  const { theme } = useAppTheme()
  const [lumaUrl, setLumaUrl] = useState('https://lu.ma/ai-builders-berlin')
  const [savedSources, setSavedSources] = useState<string[]>([])
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [contactCount, setContactCount] = useState(0)

  const refreshCount = useCallback(async () => {
    setContactCount(await countLinkedInContacts())
  }, [])

  useEffect(() => {
    void refreshCount()
    void (async () => {
      const urls = await getSavedLumaUrls()
      setSavedSources(urls)
      if (urls[0]) setLumaUrl(urls[0])
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

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      style={{ backgroundColor: theme.bg }}
    >
      <View className="mb-4 flex-row items-center justify-between">
        <Text
          style={{
            fontFamily: fonts.display,
            fontSize: 22,
            color: theme.textPrimary,
          }}
        >
          Einstellungen
        </Text>
        {onClose ? (
          <Pressable onPress={onClose}>
            <Text
              style={{
                fontFamily: fonts.uiSemiBold,
                color: theme.accent,
              }}
            >
              Fertig
            </Text>
          </Pressable>
        ) : null}
      </View>

      <Text
        className="mb-2"
        style={{
          fontFamily: fonts.uiBold,
          fontSize: 11,
          letterSpacing: 0.8,
          color: theme.textMuted,
          textTransform: 'uppercase',
        }}
      >
        LinkedIn
      </Text>
      <Text
        className="mb-3"
        style={{
          fontFamily: fonts.ui,
          fontSize: 14,
          lineHeight: 20,
          color: theme.textBody,
        }}
      >
        Ideal: Connections.csv (alle 1st-degree Kontakte). Geht auch:
        Invitations.csv (Einladungen — schwächeres Signal). LinkedIn Desktop →
        Settings → Data privacy → Get a copy of your data. Kein Scraping.
      </Text>
      <Text
        className="mb-3"
        style={{
          fontFamily: fonts.uiMedium,
          fontSize: 14,
          color: theme.textPrimary,
        }}
      >
        Importiert: {contactCount} Kontakte
      </Text>
      <Pressable
        disabled={busy}
        className="mb-6 items-center rounded-2xl py-3"
        style={{ backgroundColor: theme.accent }}
        onPress={() =>
          void run(async () => {
            const picked = await DocumentPicker.getDocumentAsync({
              type: ['text/csv', 'text/comma-separated-values', 'text/plain', '*/*'],
              copyToCacheDirectory: true,
            })
            if (picked.canceled || !picked.assets?.[0]) {
              setStatus('Abgebrochen')
              return
            }
            const asset = picked.assets[0]
            const res = await fetch(asset.uri)
            const csvText = await res.text()
            const result = await importLinkedInCsv(csvText)
            setStatus(
              `${result.imported} Kontakte importiert · ${result.overlaps_updated} Overlaps`,
            )
          })
        }
      >
        <Text
          style={{
            fontFamily: fonts.uiBold,
            fontSize: 14,
            color: theme.accentInk,
          }}
        >
          LinkedIn-CSV hochladen
        </Text>
      </Pressable>

      <Text
        className="mb-2"
        style={{
          fontFamily: fonts.uiBold,
          fontSize: 11,
          letterSpacing: 0.8,
          color: theme.textMuted,
          textTransform: 'uppercase',
        }}
      >
        Luma
      </Text>
      <Text
        className="mb-3"
        style={{
          fontFamily: fonts.ui,
          fontSize: 14,
          lineHeight: 20,
          color: theme.textBody,
        }}
      >
        Beim Öffnen lädt LuMap öffentliche Luma-Events in Berlin — auch solche,
        bei denen du noch nicht angemeldet bist. Optional: einzelne Event-URL
        speichern für Auto-Sync.
      </Text>
      <Pressable
        disabled={busy}
        className="mb-3 items-center rounded-2xl py-3"
        style={{ backgroundColor: theme.accent }}
        onPress={() =>
          void run(async () => {
            const result = await discoverLumaEvents({
              place: 'berlin',
              limit: 40,
            })
            setStatus(
              `${result.upserted ?? 0} öffentliche Events geladen (von ${result.discovered ?? 0})`,
            )
          })
        }
      >
        <Text
          style={{
            fontFamily: fonts.uiBold,
            fontSize: 14,
            color: theme.accentInk,
          }}
        >
          Berlin-Events jetzt laden
        </Text>
      </Pressable>
      {savedSources.length > 0 ? (
        <Text
          className="mb-3"
          style={{
            fontFamily: fonts.uiMedium,
            fontSize: 13,
            color: theme.textMuted,
          }}
        >
          Extra Auto-Sync: {savedSources.length} URL
          {savedSources.length === 1 ? '' : 's'}
        </Text>
      ) : null}
      <TextInput
        value={lumaUrl}
        onChangeText={setLumaUrl}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="https://lu.ma/..."
        placeholderTextColor={theme.textFaint}
        className="mb-3 rounded-2xl px-4 py-3"
        style={{
          backgroundColor: theme.cardBg,
          borderWidth: 1,
          borderColor: theme.border,
          color: theme.textPrimary,
          fontFamily: fonts.ui,
        }}
      />
      <Pressable
        disabled={busy}
        className="mb-3 items-center rounded-2xl py-3"
        style={{
          borderWidth: 1,
          borderColor: theme.border,
          backgroundColor: theme.cardBg,
        }}
        onPress={() =>
          void run(async () => {
            const url = lumaUrl.trim()
            const result = await fetchLumaEvent(url, { force: true })
            const next = await saveLumaUrl(url)
            setSavedSources(next)
            const guestCount = Array.isArray(result.guests)
              ? result.guests.length
              : 0
            setStatus(
              result.guest_list_public
                ? `Event gespeichert · ${guestCount} Gäste · Overlaps ${result.overlaps_updated ?? 0}`
                : `Event gespeichert · Guest-List privat (keine Namen)`,
            )
          })
        }
      >
        <Text
          style={{
            fontFamily: fonts.uiSemiBold,
            fontSize: 14,
            color: theme.textPrimary,
          }}
        >
          Einzelne Luma-URL syncen
        </Text>
      </Pressable>

      <Pressable
        disabled={busy}
        className="mb-6 items-center rounded-2xl py-3"
        style={{
          borderWidth: 1,
          borderColor: theme.border,
          backgroundColor: theme.cardBg,
        }}
        onPress={() =>
          void run(async () => {
            const result = await refreshOverlaps()
            setStatus(`Overlaps neu berechnet: ${result.overlaps_updated}`)
          })
        }
      >
        <Text
          style={{
            fontFamily: fonts.uiSemiBold,
            fontSize: 14,
            color: theme.textPrimary,
          }}
        >
          Overlaps neu matchen
        </Text>
      </Pressable>

      {busy ? (
        <ActivityIndicator color={theme.accent} />
      ) : status ? (
        <Text
          style={{
            fontFamily: fonts.ui,
            fontSize: 14,
            color: theme.textBody,
          }}
        >
          {status}
        </Text>
      ) : null}

      <Text
        className="mt-8"
        style={{
          fontFamily: fonts.ui,
          fontSize: 12,
          color: theme.textFaint,
        }}
      >
        Namens-Matches sind nicht verifiziert (Kollisionen möglich).
      </Text>
    </ScrollView>
  )
}
