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
import { useFonts } from 'expo-font'
import { StatusBar } from 'expo-status-bar'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, LogBox, Text, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { InteractiveHeatmap } from './src/components/InteractiveHeatmap'
import { LiveRadarFeed } from './src/components/LiveRadarFeed'
import { SettingsPanel } from './src/components/SettingsPanel'
import { TabBar, type AppTab } from './src/components/TabBar'
import { AppThemeProvider, useAppTheme } from './src/context/AppModeContext'
import { ensureSession } from './src/services/auth'
import { loadFeedEvents, syncLumaFeed } from './src/services/eventsApi'
import { getLumaPreferences } from './src/services/lumaPreferences'
import { fonts, LM } from './src/theme/tokens'
import type { EventItem } from './src/types'

LogBox.ignoreAllLogs(true)

function HomeScreen() {
  const { theme } = useAppTheme()
  const [tab, setTab] = useState<AppTab>('map')
  const [selected, setSelected] = useState<EventItem | null>(null)
  const [events, setEvents] = useState<EventItem[]>([])

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

  const onSelectFromMap = useCallback((event: EventItem) => {
    setSelected(event)
    setTab('list')
  }, [])

  const onSelectFromList = useCallback((event: EventItem) => {
    setSelected(event)
  }, [])

  return (
    <View className="flex-1" style={{ backgroundColor: theme.bg }}>
      <StatusBar style="dark" />

      <View
        style={{ flex: 1, display: tab === 'map' ? 'flex' : 'none' }}
        pointerEvents={tab === 'map' ? 'auto' : 'none'}
      >
        <InteractiveHeatmap
          events={events}
          selectedEventId={selected?.id}
          onSelectEvent={onSelectFromMap}
        />
        <SafeAreaView
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            paddingHorizontal: 16,
            paddingTop: 8,
          }}
        >
          <View
            style={{
              alignSelf: 'center',
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: theme.chrome,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <Text
              style={{
                fontFamily: fonts.display,
                fontSize: 18,
                color: theme.textPrimary,
              }}
            >
              LuMap
            </Text>
          </View>
        </SafeAreaView>
      </View>

      {tab === 'list' ? (
        <LiveRadarFeed
          events={events}
          selectedEventId={selected?.id}
          onSelectEvent={onSelectFromList}
          bottomInset={88}
        />
      ) : null}

      {tab === 'settings' ? (
        <View style={{ flex: 1, backgroundColor: theme.bg }}>
          <SettingsPanel
            bottomInset={88}
            onDataChanged={() => {
              void refresh()
            }}
          />
        </View>
      ) : null}

      <TabBar active={tab} onChange={setTab} />
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
        <AppThemeProvider>
          <HomeScreen />
        </AppThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
