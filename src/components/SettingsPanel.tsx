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
import { useAppMode } from '../context/AppModeContext'
import {
  countLinkedInContacts,
  fetchLumaEvent,
  importLinkedInCsv,
  refreshOverlaps,
} from '../services/eventsApi'

type Props = {
  onDataChanged?: () => void
  onClose?: () => void
}

export function SettingsPanel({ onDataChanged, onClose }: Props) {
  const { theme } = useAppMode()
  const [lumaUrl, setLumaUrl] = useState('https://lu.ma/ai-builders-berlin')
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [contactCount, setContactCount] = useState(0)

  const refreshCount = useCallback(async () => {
    setContactCount(await countLinkedInContacts())
  }, [])

  useEffect(() => {
    void refreshCount()
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
        <Text className="text-xl font-bold text-white">Einstellungen</Text>
        {onClose ? (
          <Pressable onPress={onClose}>
            <Text style={{ color: theme.accent }} className="font-semibold">
              Fertig
            </Text>
          </Pressable>
        ) : null}
      </View>

      <Text className="mb-2 text-xs font-bold uppercase tracking-wide text-white/50">
        LinkedIn
      </Text>
      <Text className="mb-3 text-sm leading-5 text-white/70">
        Desktop LinkedIn → Settings → Data privacy → Get a copy of your data →
        Connections → CSV hier hochladen. Kein Scraping.
      </Text>
      <Text className="mb-3 text-sm text-white/80">
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
        <Text className="text-sm font-bold text-black">
          Connections.csv hochladen
        </Text>
      </Pressable>

      <Text className="mb-2 text-xs font-bold uppercase tracking-wide text-white/50">
        Luma
      </Text>
      <Text className="mb-3 text-sm leading-5 text-white/70">
        Öffentliche Event-URL einfügen. Guest-Namen nur wenn die Liste öffentlich
        ist.
      </Text>
      <TextInput
        value={lumaUrl}
        onChangeText={setLumaUrl}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="https://lu.ma/..."
        placeholderTextColor="rgba(255,255,255,0.35)"
        className="mb-3 rounded-2xl border border-white/10 px-4 py-3 text-white"
        style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
      />
      <Pressable
        disabled={busy}
        className="mb-3 items-center rounded-2xl py-3"
        style={{ backgroundColor: theme.accent }}
        onPress={() =>
          void run(async () => {
            const result = await fetchLumaEvent(lumaUrl.trim())
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
        <Text className="text-sm font-bold text-black">Luma-Event syncen</Text>
      </Pressable>

      <Pressable
        disabled={busy}
        className="mb-6 items-center rounded-2xl border border-white/15 py-3"
        onPress={() =>
          void run(async () => {
            const result = await refreshOverlaps()
            setStatus(`Overlaps neu berechnet: ${result.overlaps_updated}`)
          })
        }
      >
        <Text className="text-sm font-semibold text-white">
          Overlaps neu matchen
        </Text>
      </Pressable>

      {busy ? (
        <ActivityIndicator color={theme.accent} />
      ) : status ? (
        <Text className="text-sm text-white/70">{status}</Text>
      ) : null}

      <Text className="mt-8 text-xs text-white/40">
        Namens-Matches sind nicht verifiziert (Kollisionen möglich).
      </Text>
    </ScrollView>
  )
}
