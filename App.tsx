import 'react-native-gesture-handler'
import './global.css'

import {
  Fredoka_500Medium,
  Fredoka_600SemiBold,
} from '@expo-google-fonts/fredoka'
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { useFonts } from 'expo-font'
import { StatusBar } from 'expo-status-bar'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { InteractiveHeatmap } from './src/components/InteractiveHeatmap'
import { LiveRadarFeed } from './src/components/LiveRadarFeed'
import { SettingsPanel } from './src/components/SettingsPanel'
import { AppThemeProvider, useAppTheme } from './src/context/AppModeContext'
import { ensureSession } from './src/services/auth'
import {
  discoverLumaEvents,
  loadFeedEvents,
  syncSavedLumaSources,
} from './src/services/eventsApi'
import { fonts, LM } from './src/theme/tokens'
import type { EventItem } from './src/types'

function HomeScreen() {
  const { theme } = useAppTheme()
  const [selected, setSelected] = useState<EventItem | null>(null)
  const [events, setEvents] = useState<EventItem[]>([])
  const [settingsOpen, setSettingsOpen] = useState(false)

  const refresh = useCallback(async () => {
    const rows = await loadFeedEvents()
    setEvents(rows)
  }, [])

  useEffect(() => {
    void (async () => {
      await ensureSession()
      // Feed first so map/list aren't empty while discover/sync runs.
      await refresh()
      try {
        await discoverLumaEvents({ place: 'berlin', limit: 30 })
      } catch (error) {
        console.warn(
          '[luma] discover failed',
          error instanceof Error ? error.message : error,
        )
      }
      await syncSavedLumaSources()
      await refresh()
    })()
  }, [refresh])

  const onSelectEvent = useCallback((event: EventItem) => {
    setSelected(event)
  }, [])

  return (
    <View className="flex-1" style={{ backgroundColor: theme.bg }}>
      <StatusBar style="dark" />
      <InteractiveHeatmap events={events} onSelectEvent={onSelectEvent} />
      <SafeAreaView
        pointerEvents="box-none"
        className="absolute left-0 right-0 top-0 px-4 pt-2"
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => setSettingsOpen(true)}
            className="rounded-full px-3 py-2"
            style={{
              backgroundColor: theme.chrome,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <Text
              style={{
                fontFamily: fonts.uiSemiBold,
                fontSize: 12,
                color: theme.textPrimary,
              }}
            >
              Settings
            </Text>
          </Pressable>
          <Text
            style={{
              fontFamily: fonts.display,
              fontSize: 20,
              color: theme.textPrimary,
            }}
          >
            LuMap
          </Text>
          <View style={{ width: 72 }} />
        </View>
      </SafeAreaView>
      <LiveRadarFeed
        events={events}
        selectedEventId={selected?.id}
        onSelectEvent={onSelectEvent}
      />

      <Modal
        visible={settingsOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSettingsOpen(false)}
      >
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
            <SettingsPanel
              onClose={() => setSettingsOpen(false)}
              onDataChanged={() => {
                void refresh()
              }}
            />
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    </View>
  )
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  })

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: LM.paperMist,
        }}
      >
        <ActivityIndicator color={LM.sky500} />
      </View>
    )
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <AppThemeProvider>
            <HomeScreen />
          </AppThemeProvider>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
