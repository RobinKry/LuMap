import { BlurView } from 'expo-blur'
import { useEffect } from 'react'
import { Pressable, Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { useAppMode } from '../context/AppModeContext'
import type { AppMode } from '../types'

const OPTIONS: { mode: AppMode; label: string }[] = [
  { mode: 'PARTY', label: '🔥 PARTY' },
  { mode: 'WORK', label: '💼 WORK' },
]

const PILL_WIDTH = 118

export function ModeSwitch() {
  const { mode, theme, setMode } = useAppMode()
  const offset = useSharedValue(mode === 'PARTY' ? 0 : PILL_WIDTH)

  useEffect(() => {
    offset.value = withSpring(mode === 'PARTY' ? 0 : PILL_WIDTH, {
      damping: 18,
      stiffness: 220,
      mass: 0.8,
    })
  }, [mode, offset])

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }))

  return (
    <View className="self-center overflow-hidden rounded-full border border-white/15">
      <BlurView intensity={35} tint="dark" className="overflow-hidden rounded-full">
        <View className="relative flex-row p-1">
          <Animated.View
            className="absolute bottom-1 top-1 rounded-full"
            style={[
              {
                width: PILL_WIDTH,
                left: 4,
                backgroundColor: theme.accent,
                opacity: 0.92,
              },
              pillStyle,
            ]}
          />
          {OPTIONS.map((option) => {
            const active = mode === option.mode
            return (
              <Pressable
                key={option.mode}
                onPress={() => setMode(option.mode)}
                style={{ width: PILL_WIDTH }}
                className="items-center justify-center py-2.5"
              >
                <Text
                  className="text-xs font-bold tracking-wide"
                  style={{ color: active ? '#0A0A0F' : '#F5F5F7' }}
                >
                  {option.label}
                </Text>
              </Pressable>
            )
          })}
        </View>
      </BlurView>
    </View>
  )
}
