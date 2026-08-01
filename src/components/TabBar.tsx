import type { ComponentType } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Svg, { Circle, Path } from 'react-native-svg'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAppTheme } from '../context/AppModeContext'
import { fonts } from '../theme/tokens'

/** Same tabs as the first LuMap scaffold: Liste | Karte | Einstellungen */
export type AppTab = 'list' | 'map' | 'settings'

type IconProps = { color: string }

const TABS: {
  id: AppTab
  label: string
  Icon: ComponentType<IconProps>
}[] = [
  { id: 'list', label: 'Liste', Icon: ListIcon },
  { id: 'map', label: 'Karte', Icon: MapIcon },
  { id: 'settings', label: 'Einstellungen', Icon: SettingsIcon },
]

/** Cool gray fill — mirrors first-scaffold `--surface-strong` */
const SURFACE_STRONG = '#E2E8EF'

type Props = {
  active: AppTab
  onChange: (tab: AppTab) => void
}

export function TabBar({ active, onChange }: Props) {
  const { theme } = useAppTheme()
  const insets = useSafeAreaInsets()

  return (
    <View
      style={[
        styles.bar,
        {
          paddingBottom: Math.max(insets.bottom, 8),
          backgroundColor: theme.sheetBg,
          borderTopColor: theme.border,
        },
      ]}
      accessibilityRole="tablist"
    >
      {TABS.map(({ id, label, Icon }) => {
        const selected = id === active
        const iconColor = selected ? theme.accent : theme.textMuted
        return (
          <Pressable
            key={id}
            onPress={() => onChange(id)}
            style={({ pressed }) => [
              styles.item,
              selected && { backgroundColor: SURFACE_STRONG },
              pressed && { transform: [{ scale: 0.96 }] },
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={label}
          >
            <Icon color={iconColor} />
            <Text
              style={[
                styles.label,
                {
                  fontFamily: selected ? fonts.uiSemiBold : fonts.uiMedium,
                  color: selected ? theme.textPrimary : theme.textMuted,
                },
              ]}
            >
              {label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

function ListIcon({ color }: IconProps) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  )
}

function MapIcon({ color }: IconProps) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3z"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Path d="M9 3v15M15 6v15" stroke={color} strokeWidth={2} />
    </Svg>
  )
}

function SettingsIcon({ color }: IconProps) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={2} />
      <Path
        d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  )
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    flexDirection: 'row',
    gap: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    paddingHorizontal: 12,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderRadius: 12,
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
})
