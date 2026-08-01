import { useEffect, useRef } from 'react'
import { FlatList, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAppTheme } from '../context/AppModeContext'
import { fonts } from '../theme/tokens'
import type { EventItem } from '../types'
import { EventCard } from './EventCard'

type Props = {
  events: EventItem[]
  selectedEventId?: string | null
  onSelectEvent: (event: EventItem) => void
  /** Extra bottom padding inside the list (tab bar is a flex sibling). */
  bottomInset?: number
}

export function LiveRadarFeed({
  events,
  selectedEventId,
  onSelectEvent,
  bottomInset = 24,
}: Props) {
  const { theme } = useAppTheme()
  const insets = useSafeAreaInsets()
  const listRef = useRef<FlatList<EventItem>>(null)

  useEffect(() => {
    if (!selectedEventId || events.length === 0) return
    const index = events.findIndex((e) => e.id === selectedEventId)
    if (index < 0) return
    const handle = requestAnimationFrame(() => {
      try {
        listRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.15,
        })
      } catch {
        listRef.current?.scrollToOffset({ offset: Math.max(0, index * 280), animated: true })
      }
    })
    return () => cancelAnimationFrame(handle)
  }, [selectedEventId, events])

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 20,
          paddingBottom: 12,
        }}
      >
        <Text
          style={{
            fontFamily: fonts.display,
            fontSize: 28,
            color: theme.textPrimary,
          }}
        >
          Events
        </Text>
        <Text
          style={{
            marginTop: 4,
            fontFamily: fonts.ui,
            fontSize: 13,
            color: theme.textMuted,
          }}
        >
          {events.length} in der Liste
        </Text>
      </View>

      <FlatList
        ref={listRef}
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: bottomInset + insets.bottom,
          flexGrow: 1,
        }}
        onScrollToIndexFailed={(info) => {
          listRef.current?.scrollToOffset({
            offset: Math.max(0, info.index * 280),
            animated: true,
          })
        }}
        ListEmptyComponent={
          <Text
            style={{
              marginTop: 48,
              textAlign: 'center',
              fontFamily: fonts.ui,
              fontSize: 14,
              lineHeight: 22,
              color: theme.textMuted,
              paddingHorizontal: 24,
            }}
          >
            Noch keine Events.{'\n'}Settings → Luma-Profil verknüpfen und
            Interessen wählen.
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
    </View>
  )
}
