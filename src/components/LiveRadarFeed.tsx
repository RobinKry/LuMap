import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import * as WebBrowser from 'expo-web-browser'
import { forwardRef, useMemo } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useAppMode } from '../context/AppModeContext'
import type { EventAttendeePreview, EventItem } from '../types'
import { FriendAvatarStack, LinkedInEventCard } from './LinkedInEventCard'

type FeedEvent = EventItem & {
  friends?: EventAttendeePreview[]
  otherCount?: number
}

type Props = {
  events: FeedEvent[]
  selectedEventId?: string | null
  onSelectEvent: (event: EventItem) => void
}

function platformBadge(event: EventItem) {
  switch (event.source_platform) {
    case 'LUMA':
      return '💼 lu.ma'
    case 'PARTIFUL':
      return '🎉 partiful'
    case 'LINKEDIN':
      return '💼 linkedin'
    case 'EVENTBRITE':
      return '🎫 eventbrite'
    default:
      return event.source_platform
  }
}

export const LiveRadarFeed = forwardRef<BottomSheet, Props>(
  function LiveRadarFeed({ events, selectedEventId, onSelectEvent }, ref) {
    const { mode, theme } = useAppMode()
    const snapPoints = useMemo(() => ['18%', '42%', '78%'], [])

    const filtered = useMemo(
      () => events.filter((event) => event.mode === mode),
      [events, mode],
    )

    return (
      <BottomSheet
        ref={ref}
        index={1}
        snapPoints={snapPoints}
        backgroundStyle={{ backgroundColor: theme.cardBg }}
        handleIndicatorStyle={{ backgroundColor: 'rgba(255,255,255,0.35)' }}
      >
        <View className="px-4 pb-2">
          <Text className="text-base font-bold text-white">Live Radar</Text>
          <Text className="text-xs text-white/55">
            {filtered.length} events · {mode}
          </Text>
        </View>

        <BottomSheetFlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
          ListEmptyComponent={
            <Text className="mt-6 text-center text-sm text-white/50">
              No events for {mode} yet.
            </Text>
          }
          renderItem={({ item }) => {
            const selected = item.id === selectedEventId
            return (
              <Pressable
                onPress={() => onSelectEvent(item)}
                className="mb-3 rounded-3xl border p-4"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  borderColor: selected ? theme.accent : 'rgba(255,255,255,0.08)',
                }}
              >
                <View className="mb-2 flex-row items-center justify-between">
                  <Text className="text-[11px] font-bold tracking-wide text-white/75">
                    {platformBadge(item)}
                  </Text>
                  {item.is_residential ? (
                    <Text className="text-[10px] font-semibold text-white/45">
                      neighborhood (blurred)
                    </Text>
                  ) : null}
                </View>

                <Text className="text-base font-semibold text-white">
                  {item.title}
                </Text>
                {item.venue_name ? (
                  <Text className="mt-1 text-xs text-white/55">
                    {item.venue_name}
                  </Text>
                ) : null}

                <View className="mt-3 flex-row gap-4">
                  <View>
                    <Text className="text-base font-semibold text-white">
                      {item.attendee_count ?? '—'}
                    </Text>
                    <Text className="text-[10px] text-white/50">dabei</Text>
                  </View>
                  <View>
                    <Text className="text-base font-semibold text-white">
                      {item.linkedin_match_count ?? 0}
                    </Text>
                    <Text className="text-[10px] text-white/50">
                      LinkedIn-Match
                    </Text>
                  </View>
                </View>
                {(item.match_preview?.length ?? 0) > 0 ? (
                  <Text className="mt-2 text-[11px] text-white/45">
                    z. B. {item.match_preview!.slice(0, 3).join(', ')}
                    {item.guest_list_public === false
                      ? ''
                      : ' · Namens-Match'}
                  </Text>
                ) : null}

                <FriendAvatarStack
                  friends={item.friends ?? []}
                  extraCount={item.otherCount ?? 0}
                />

                {item.source_platform === 'LINKEDIN' ? (
                  <LinkedInEventCard event={item} />
                ) : null}

                <Pressable
                  className="mt-4 items-center rounded-2xl py-3"
                  style={{ backgroundColor: theme.accent }}
                  onPress={() => {
                    if (item.event_url) {
                      void WebBrowser.openBrowserAsync(item.event_url)
                    }
                  }}
                >
                  <Text className="text-sm font-bold text-black">
                    Open Event Link
                  </Text>
                </Pressable>
              </Pressable>
            )
          }}
        />
      </BottomSheet>
    )
  },
)
