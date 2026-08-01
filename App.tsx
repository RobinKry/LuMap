import 'react-native-gesture-handler'
import './global.css'

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { StatusBar } from 'expo-status-bar'
import { useCallback, useEffect, useState } from 'react'
import { Modal, Pressable, Text, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { InteractiveHeatmap } from './src/components/InteractiveHeatmap'
import { LiveRadarFeed } from './src/components/LiveRadarFeed'
import { ModeSwitch } from './src/components/ModeSwitch'
import { SettingsPanel } from './src/components/SettingsPanel'
import { AppModeProvider, useAppMode } from './src/context/AppModeContext'
import { mockFeedEvents } from './src/data/mockFeedEvents'
import { ensureSession } from './src/services/auth'
import { loadFeedEvents } from './src/services/eventsApi'
import type { EventItem } from './src/types'

function HomeScreen() {
  const { theme } = useAppMode()
  const [selected, setSelected] = useState<EventItem | null>(null)
  const [events, setEvents] = useState<EventItem[]>(mockFeedEvents)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const refresh = useCallback(async () => {
    const rows = await loadFeedEvents()
    if (rows.length > 0) {
      setEvents(rows)
    }
  }, [])

  useEffect(() => {
    void (async () => {
      await ensureSession()
      await refresh()
    })()
  }, [refresh])

  const onSelectEvent = useCallback((event: EventItem) => {
    setSelected(event)
  }, [])

  return (
    <View className="flex-1" style={{ backgroundColor: theme.bg }}>
      <StatusBar style="light" />
      <InteractiveHeatmap events={events} onSelectEvent={onSelectEvent} />
      <SafeAreaView
        pointerEvents="box-none"
        className="absolute left-0 right-0 top-0 px-4 pt-2"
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => setSettingsOpen(true)}
            className="rounded-full border border-white/15 px-3 py-2"
            style={{ backgroundColor: 'rgba(20,20,28,0.55)' }}
          >
            <Text className="text-xs font-semibold text-white">Settings</Text>
          </Pressable>
          <ModeSwitch />
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
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <AppModeProvider>
            <HomeScreen />
          </AppModeProvider>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
