import 'react-native-gesture-handler'
import './global.css'

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { StatusBar } from 'expo-status-bar'
import { useCallback, useState } from 'react'
import { View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { InteractiveHeatmap } from './src/components/InteractiveHeatmap'
import { LiveRadarFeed } from './src/components/LiveRadarFeed'
import { ModeSwitch } from './src/components/ModeSwitch'
import { AppModeProvider, useAppMode } from './src/context/AppModeContext'
import { mockFeedEvents } from './src/data/mockFeedEvents'
import type { EventItem } from './src/types'

function HomeScreen() {
  const { theme } = useAppMode()
  const [selected, setSelected] = useState<EventItem | null>(null)

  const onSelectEvent = useCallback((event: EventItem) => {
    setSelected(event)
  }, [])

  return (
    <View className="flex-1" style={{ backgroundColor: theme.bg }}>
      <StatusBar style="light" />
      <InteractiveHeatmap
        events={mockFeedEvents}
        onSelectEvent={onSelectEvent}
      />
      <SafeAreaView
        pointerEvents="box-none"
        className="absolute left-0 right-0 top-0 items-center px-4 pt-2"
      >
        <ModeSwitch />
      </SafeAreaView>
      <LiveRadarFeed
        events={mockFeedEvents}
        selectedEventId={selected?.id}
        onSelectEvent={onSelectEvent}
      />
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
