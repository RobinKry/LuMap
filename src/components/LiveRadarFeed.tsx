import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { forwardRef, useMemo } from 'react'
import { Text, View } from 'react-native'
import { useAppTheme } from '../context/AppModeContext'
import { fonts, LM } from '../theme/tokens'
import type { EventItem } from '../types'
import { EventCard } from './EventCard'

type Props = {
  events: EventItem[]
  selectedEventId?: string | null
  onSelectEvent: (event: EventItem) => void
}

export const LiveRadarFeed = forwardRef<BottomSheet, Props>(
  function LiveRadarFeed({ events, selectedEventId, onSelectEvent }, ref) {
    const { theme } = useAppTheme()
    const snapPoints = useMemo(() => ['18%', '42%', '82%'], [])

    return (
      <BottomSheet
        ref={ref}
        index={1}
        snapPoints={snapPoints}
        backgroundStyle={{
          backgroundColor: theme.sheetBg,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
        }}
        handleIndicatorStyle={{ backgroundColor: LM.alpha14, width: 40 }}
      >
        <View className="px-4 pb-2">
          <Text
            style={{
              fontFamily: fonts.display,
              fontSize: 18,
              color: theme.textPrimary,
            }}
          >
            Live Radar
          </Text>
          <Text
            style={{
              fontFamily: fonts.ui,
              fontSize: 12,
              color: theme.textMuted,
            }}
          >
            {events.length} events
          </Text>
        </View>

        <BottomSheetFlatList
          data={events}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
          ListEmptyComponent={
            <Text
              className="mt-6 text-center"
              style={{
                fontFamily: fonts.ui,
                fontSize: 14,
                color: theme.textMuted,
              }}
            >
              Noch keine Events.{'\n'}Öffentliche Luma-Events in Berlin werden
              beim Öffnen geladen — oder Settings → Luma syncen.
            </Text>
          }
          renderItem={({ item }) => (
            <EventCard
              event={item}
              selected={item.id === selectedEventId}
              onSelect={() => onSelectEvent(item)}
            />
          )}
        />
      </BottomSheet>
    )
  },
)
