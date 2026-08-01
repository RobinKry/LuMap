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
import { NavigationContainer, DefaultTheme } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { StatusBar } from 'expo-status-bar'
import { ActivityIndicator, LogBox, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AppThemeProvider } from './src/context/AppModeContext'
import { EventsProvider } from './src/context/EventsContext'
import { RootTabNavigator } from './src/navigation/RootTabNavigator'
import { LM } from './src/theme/tokens'

LogBox.ignoreAllLogs(true)

/** Build-1 accent from LuMapTheme.swift — used as Navigation theme tint. */
const ACCENT = '#0A8A6A'

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: ACCENT,
    background: LM.paperMist,
    card: '#FFFFFF',
    text: '#12171D',
    border: 'rgba(60, 60, 67, 0.29)',
    notification: ACCENT,
  },
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
          <EventsProvider>
            <NavigationContainer theme={navTheme}>
              <StatusBar style="dark" />
              <RootTabNavigator />
            </NavigationContainer>
          </EventsProvider>
        </AppThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
