import {
  createNativeBottomTabNavigator,
  type NativeBottomTabNavigationProp,
} from '@react-navigation/bottom-tabs/unstable'
import { useNavigation } from '@react-navigation/native'
import { useCallback } from 'react'
import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { InteractiveHeatmap } from '../components/InteractiveHeatmap'
import { LiveRadarFeed } from '../components/LiveRadarFeed'
import { SettingsPanel } from '../components/SettingsPanel'
import { useAppTheme } from '../context/AppModeContext'
import { useEvents } from '../context/EventsContext'
import { fonts } from '../theme/tokens'
import type { EventItem } from '../types'

/**
 * Faithful restore of Build 1 iOS tab bar from `9014e33` RootTabView.swift:
 * SwiftUI TabView — Liste / Karte / Einstellungen, SF Symbols, `.tint(LuMapTheme.accent)`.
 * Uses react-native-screens native UITabBar (not a hand-drawn RN View).
 */
export type RootTabParamList = {
  List: undefined
  Map: undefined
  Settings: undefined
}

const Tab = createNativeBottomTabNavigator<RootTabParamList>()

/** Build-1 LuMapTheme.accent — Color(red: 10/255, green: 138/255, blue: 106/255) */
const ACCENT = '#0A8A6A'

function MapScreen() {
  const { theme } = useAppTheme()
  const { events, selected, setSelected } = useEvents()
  const navigation =
    useNavigation<NativeBottomTabNavigationProp<RootTabParamList>>()

  const onSelectFromMap = useCallback(
    (event: EventItem) => {
      setSelected(event)
      navigation.navigate('List')
    },
    [navigation, setSelected],
  )

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
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
  )
}

function ListScreen() {
  const { events, selected, setSelected } = useEvents()

  return (
    <LiveRadarFeed
      events={events}
      selectedEventId={selected?.id}
      onSelectEvent={setSelected}
      bottomInset={24}
    />
  )
}

function SettingsScreen() {
  const { theme } = useAppTheme()
  const { refresh } = useEvents()

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <SettingsPanel
        bottomInset={24}
        onDataChanged={() => {
          void refresh()
        }}
      />
    </View>
  )
}

export function RootTabNavigator() {
  return (
    <Tab.Navigator
      id="RootTabs"
      initialRouteName="Map"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACCENT,
        // Match SwiftUI TabView default chrome (system material blur).
        tabBarBlurEffect: 'systemDefault',
      }}
    >
      <Tab.Screen
        name="List"
        component={ListScreen}
        options={{
          title: 'Liste',
          tabBarLabel: 'Liste',
          tabBarIcon: { type: 'sfSymbol', name: 'list.bullet' },
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          title: 'Karte',
          tabBarLabel: 'Karte',
          tabBarIcon: { type: 'sfSymbol', name: 'map' },
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Einstellungen',
          tabBarLabel: 'Einstellungen',
          tabBarIcon: { type: 'sfSymbol', name: 'gearshape' },
        }}
      />
    </Tab.Navigator>
  )
}
