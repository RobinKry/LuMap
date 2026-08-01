import * as WebBrowser from 'expo-web-browser'
import { Image } from 'expo-image'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { useAppTheme } from '../context/AppModeContext'
import { fonts, LM } from '../theme/tokens'
import type { EventAttendeePreview, EventItem, MatchPersonPreview } from '../types'

const AVATAR_TINTS = [LM.lilac300, LM.mint300, LM.butter300, LM.peach300]
const TOP_MATCHES = 5
const LINKEDIN_WASH = 'rgba(10,102,194,0.07)'

function platformBadge(platform: EventItem['source_platform']) {
  switch (platform) {
    case 'LUMA':
      return 'lu.ma'
    case 'PARTIFUL':
      return 'partiful'
    case 'LINKEDIN':
      return 'linkedin'
    case 'EVENTBRITE':
      return 'eventbrite'
    default:
      return platform
  }
}

function sharedEventsLabel(shared: number | undefined): string | null {
  if (typeof shared !== 'number' || !Number.isFinite(shared) || shared <= 0) {
    return null
  }
  return shared === 1 ? '1 gemeinsames Event' : `${shared} gemeinsame Events`
}

function GuestRow({
  guest,
  index,
  emphasize,
  isLast,
}: {
  guest: EventAttendeePreview
  index: number
  emphasize?: boolean
  isLast?: boolean
}) {
  const { theme } = useAppTheme()
  const initial = (guest.display_name || '?').slice(0, 1).toUpperCase()
  const sharedLabel = emphasize ? sharedEventsLabel(guest.shared_events) : null

  return (
    <View
      className="flex-row items-center gap-2.5"
      style={{ marginBottom: isLast ? 0 : 8 }}
    >
      <View
        className="h-7 w-7 items-center justify-center overflow-hidden rounded-full"
        style={{ backgroundColor: AVATAR_TINTS[index % AVATAR_TINTS.length] }}
      >
        {guest.avatar_url ? (
          <Image
            source={{ uri: guest.avatar_url }}
            style={{ width: 28, height: 28 }}
            contentFit="cover"
          />
        ) : (
          <Text
            style={{
              fontFamily: fonts.displayMedium,
              fontSize: 11,
              color: LM.ink900,
            }}
          >
            {initial}
          </Text>
        )}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: emphasize ? fonts.uiSemiBold : fonts.uiMedium,
            fontSize: 13,
            color: theme.textBody,
          }}
        >
          {guest.display_name}
        </Text>
        {sharedLabel ? (
          <Text
            numberOfLines={1}
            style={{
              fontFamily: fonts.ui,
              fontSize: 11,
              lineHeight: 14,
              marginTop: 1,
              color: theme.textMuted,
            }}
          >
            {sharedLabel}
          </Text>
        ) : null}
      </View>
    </View>
  )
}

type Props = {
  event: EventItem
  selected?: boolean
  onSelect?: () => void
}

export function EventCard({ event, selected = false, onSelect }: Props) {
  const { theme } = useAppTheme()
  const guests = event.guests ?? []
  const description = (event.description ?? '').trim()
  const hasAttendeeCount =
    typeof event.attendee_count === 'number' &&
    Number.isFinite(event.attendee_count) &&
    event.attendee_count > 0

  const matchPeople: MatchPersonPreview[] =
    event.match_people && event.match_people.length > 0
      ? event.match_people
      : (event.match_preview ?? []).map((full_name) => ({
          full_name,
          shared_events:
            guests.find(
              (g) =>
                g.display_name.trim().toLowerCase() ===
                full_name.trim().toLowerCase(),
            )?.shared_events ?? 0,
        }))

  const topMatches = matchPeople.slice(0, TOP_MATCHES)
  const topMatchNameSet = new Set(
    topMatches.map((p) => p.full_name.trim().toLowerCase()),
  )

  // Prefer guest rows for matches when available (avatar + shared_events).
  const matchGuestRows: EventAttendeePreview[] = topMatches.map((person, i) => {
    const key = person.full_name.trim().toLowerCase()
    const fromGuest = guests.find(
      (g) => g.display_name.trim().toLowerCase() === key,
    )
    if (fromGuest) {
      return {
        ...fromGuest,
        shared_events:
          fromGuest.shared_events ??
          (person.shared_events > 0 ? person.shared_events : undefined),
      }
    }
    return {
      id: `match-${event.id}-${i}-${person.full_name}`,
      display_name: person.full_name,
      avatar_url: null,
      ...(person.shared_events > 0
        ? { shared_events: person.shared_events }
        : {}),
    }
  })

  const otherGuests = guests.filter(
    (g) => !topMatchNameSet.has(g.display_name.trim().toLowerCase()),
  )

  const showMatches = topMatches.length > 0
  const showOtherGuests = otherGuests.length > 0
  const showPeopleSection = showMatches || showOtherGuests

  return (
    <Pressable
      onPress={onSelect}
      className="mb-3 overflow-hidden rounded-3xl"
      style={{
        backgroundColor: theme.cardBg,
        borderWidth: 2,
        borderColor: selected ? theme.accent : 'transparent',
        shadowColor: LM.ink900,
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      }}
    >
      {event.cover_url ? (
        <Image
          source={{ uri: event.cover_url }}
          style={{ width: '100%', height: 140 }}
          contentFit="cover"
        />
      ) : null}

      <View className="p-4">
        <View className="mb-2 flex-row items-center justify-between gap-2">
          <Text
            style={{
              fontFamily: fonts.uiBold,
              fontSize: 11,
              letterSpacing: 0.4,
              color: theme.textMuted,
            }}
          >
            {platformBadge(event.source_platform)}
          </Text>
          {event.is_residential ? (
            <View
              className="rounded-full px-2.5 py-1"
              style={{ backgroundColor: LM.alpha06 }}
            >
              <Text
                style={{
                  fontFamily: fonts.uiSemiBold,
                  fontSize: 10,
                  color: theme.textMuted,
                }}
              >
                neighborhood (blurred)
              </Text>
            </View>
          ) : null}
        </View>

        <Text
          style={{
            fontFamily: fonts.display,
            fontSize: 18,
            letterSpacing: -0.3,
            color: theme.textPrimary,
            lineHeight: 24,
          }}
        >
          {event.title}
        </Text>

        {event.venue_name ? (
          <Text
            className="mt-1"
            style={{
              fontFamily: fonts.display,
              fontSize: 15,
              letterSpacing: -0.2,
              lineHeight: 20,
              color: theme.textPrimary,
            }}
          >
            {event.venue_name}
          </Text>
        ) : null}

        {event.host_name ? (
          <Text
            className="mt-0.5"
            style={{
              fontFamily: fonts.uiMedium,
              fontSize: 12,
              color: theme.textBody,
            }}
          >
            Host · {event.host_name}
          </Text>
        ) : null}

        {description ? (
          <Text
            className="mt-2"
            numberOfLines={4}
            style={{
              fontFamily: fonts.ui,
              fontSize: 13,
              lineHeight: 19,
              color: theme.textBody,
            }}
          >
            {description}
          </Text>
        ) : null}

        {hasAttendeeCount ? (
          <View className="mt-2.5">
            <Text
              style={{
                fontFamily: fonts.display,
                fontSize: 16,
                letterSpacing: -0.2,
                lineHeight: 20,
                color: theme.textPrimary,
              }}
            >
              {event.attendee_count}
            </Text>
            <Text
              style={{
                fontFamily: fonts.ui,
                fontSize: 10,
                marginTop: 1,
                color: theme.textMuted,
              }}
            >
              dabei
            </Text>
          </View>
        ) : null}

        {showPeopleSection ? (
          <View className="mt-3">
            {showMatches ? (
              <View
                className="mb-3 rounded-2xl px-3 py-2.5"
                style={{ backgroundColor: LINKEDIN_WASH }}
              >
                <Text
                  style={{
                    fontFamily: fonts.uiBold,
                    fontSize: 10,
                    letterSpacing: 0.8,
                    color: LM.linkedin,
                    textTransform: 'uppercase',
                    marginBottom: 8,
                  }}
                >
                  Deine Connections
                </Text>
                {matchGuestRows.map((g, i) => (
                  <GuestRow
                    key={g.id}
                    guest={g}
                    index={i}
                    emphasize
                    isLast={i === matchGuestRows.length - 1}
                  />
                ))}
              </View>
            ) : null}

            {showOtherGuests ? (
              <View>
                <Text
                  style={{
                    fontFamily: fonts.uiBold,
                    fontSize: 10,
                    letterSpacing: 0.8,
                    color: theme.textMuted,
                    textTransform: 'uppercase',
                    marginBottom: 8,
                  }}
                >
                  {showMatches ? 'Weitere Gäste' : 'Gäste'}
                </Text>
                <ScrollView style={{ maxHeight: 140 }} nestedScrollEnabled>
                  {otherGuests.slice(0, 24).map((g, i) => {
                    const visible = Math.min(otherGuests.length, 24)
                    return (
                      <GuestRow
                        key={g.id}
                        guest={g}
                        index={i}
                        isLast={i === visible - 1 && otherGuests.length <= 24}
                      />
                    )
                  })}
                  {otherGuests.length > 24 ? (
                    <Text
                      style={{
                        fontFamily: fonts.ui,
                        fontSize: 12,
                        color: theme.textMuted,
                        marginTop: 2,
                      }}
                    >
                      +{otherGuests.length - 24} weitere
                    </Text>
                  ) : null}
                </ScrollView>
              </View>
            ) : null}
          </View>
        ) : null}

        {event.source_platform === 'LINKEDIN' && event.original_author_name ? (
          <View
            className="mt-3 rounded-2xl px-3 py-2.5"
            style={{ backgroundColor: LINKEDIN_WASH }}
          >
            <Text
              style={{
                fontFamily: fonts.uiSemiBold,
                fontSize: 13,
                color: LM.linkedin,
              }}
            >
              {event.original_author_name}
            </Text>
            {event.original_author_headline ? (
              <Text
                style={{
                  fontFamily: fonts.ui,
                  fontSize: 11,
                  color: theme.textMuted,
                }}
              >
                {event.original_author_headline}
              </Text>
            ) : null}
          </View>
        ) : null}

        <Pressable
          className="mt-4 items-center rounded-2xl py-3"
          style={{ backgroundColor: theme.accent }}
          onPress={() => {
            if (event.event_url) {
              void WebBrowser.openBrowserAsync(event.event_url)
            }
          }}
        >
          <Text
            style={{
              fontFamily: fonts.uiBold,
              fontSize: 14,
              color: theme.accentInk,
            }}
          >
            Open Event Link
          </Text>
        </Pressable>
      </View>
    </Pressable>
  )
}
