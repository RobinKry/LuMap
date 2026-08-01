import * as WebBrowser from 'expo-web-browser'
import { Image } from 'expo-image'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { useAppTheme } from '../context/AppModeContext'
import { fonts, LM } from '../theme/tokens'
import type { EventAttendeePreview, EventItem } from '../types'

const AVATAR_TINTS = [LM.lilac300, LM.mint300, LM.butter300, LM.peach300]

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

function GuestRow({
  guest,
  index,
  isMatch,
}: {
  guest: EventAttendeePreview
  index: number
  isMatch?: boolean
}) {
  const { theme } = useAppTheme()
  const initial = (guest.display_name || '?').slice(0, 1).toUpperCase()
  const shared = guest.shared_events ?? 0
  const sharedLabel =
    isMatch && shared > 0
      ? shared === 1
        ? ' · 1 gemeinsames Event'
        : ` · ${shared} gemeinsame Events`
      : isMatch
        ? ' · LinkedIn'
        : ''
  return (
    <View className="mb-2 flex-row items-center gap-2.5">
      <View
        className="h-8 w-8 items-center justify-center overflow-hidden rounded-full"
        style={{ backgroundColor: AVATAR_TINTS[index % AVATAR_TINTS.length] }}
      >
        {guest.avatar_url ? (
          <Image
            source={{ uri: guest.avatar_url }}
            style={{ width: 32, height: 32 }}
            contentFit="cover"
          />
        ) : (
          <Text
            style={{
              fontFamily: fonts.displayMedium,
              fontSize: 12,
              color: LM.ink900,
            }}
          >
            {initial}
          </Text>
        )}
      </View>
      <Text
        numberOfLines={1}
        style={{
          flex: 1,
          fontFamily: isMatch ? fonts.uiSemiBold : fonts.uiMedium,
          fontSize: 13,
          color: isMatch ? LM.linkedin : theme.textBody,
        }}
      >
        {guest.display_name}
        {sharedLabel}
      </Text>
    </View>
  )
}

function formatMatchPerson(name: string, shared: number): string {
  if (shared > 1) return `${name} · ${shared} Events`
  if (shared === 1) return `${name} · 1 Event`
  return name
}

type Props = {
  event: EventItem
  selected?: boolean
  onSelect?: () => void
}

export function EventCard({ event, selected = false, onSelect }: Props) {
  const { theme } = useAppTheme()
  const guests = event.guests ?? []
  const showGuests = event.guest_list_public && guests.length > 0
  const description = (event.description ?? '').trim()
  const hasAttendeeCount =
    typeof event.attendee_count === 'number' &&
    Number.isFinite(event.attendee_count)
  const hasLinkedInMatches =
    typeof event.linkedin_match_count === 'number' &&
    event.linkedin_match_count > 0
  const matchPeople =
    event.match_people && event.match_people.length > 0
      ? event.match_people
      : (event.match_preview ?? []).map((full_name) => ({
          full_name,
          shared_events: 1,
        }))
  const matchNameSet = new Set(
    matchPeople.map((p) => p.full_name.trim().toLowerCase()),
  )
  const matchPreviewLabel = matchPeople
    .slice(0, 3)
    .map((p) => formatMatchPerson(p.full_name, p.shared_events))
    .join(', ')

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
              fontFamily: fonts.ui,
              fontSize: 12,
              color: theme.textMuted,
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

        {hasAttendeeCount || hasLinkedInMatches ? (
          <View className="mt-3 flex-row gap-5">
            {hasAttendeeCount ? (
              <View>
                <Text
                  style={{
                    fontFamily: fonts.display,
                    fontSize: 18,
                    color: theme.textPrimary,
                  }}
                >
                  {event.attendee_count}
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.ui,
                    fontSize: 10,
                    color: theme.textMuted,
                  }}
                >
                  dabei
                </Text>
              </View>
            ) : null}
            {hasLinkedInMatches ? (
              <View>
                <Text
                  style={{
                    fontFamily: fonts.display,
                    fontSize: 18,
                    color: theme.textPrimary,
                  }}
                >
                  {event.linkedin_match_count}
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.ui,
                    fontSize: 10,
                    color: theme.textMuted,
                  }}
                >
                  LinkedIn-Match
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {matchPeople.length > 0 ? (
          <Text
            className="mt-2"
            style={{
              fontFamily: fonts.ui,
              fontSize: 11,
              color: theme.textMuted,
            }}
          >
            z. B. {matchPreviewLabel}
            {event.guest_list_public === false ? '' : ' · Namens-Match'}
          </Text>
        ) : null}

        {showGuests ? (
          <View className="mt-3">
            <Text
              className="mb-2"
              style={{
                fontFamily: fonts.uiBold,
                fontSize: 10,
                letterSpacing: 0.8,
                color: theme.textMuted,
                textTransform: 'uppercase',
              }}
            >
              Teilnehmer
            </Text>
            <ScrollView style={{ maxHeight: 140 }} nestedScrollEnabled>
              {guests.slice(0, 24).map((g, i) => (
                <GuestRow
                  key={g.id}
                  guest={g}
                  index={i}
                  isMatch={matchNameSet.has(g.display_name.trim().toLowerCase())}
                />
              ))}
              {guests.length > 24 ? (
                <Text
                  style={{
                    fontFamily: fonts.ui,
                    fontSize: 12,
                    color: theme.textMuted,
                  }}
                >
                  +{guests.length - 24} weitere
                </Text>
              ) : null}
            </ScrollView>
          </View>
        ) : event.guest_list_public === false ? (
          <Text
            className="mt-3"
            style={{
              fontFamily: fonts.ui,
              fontSize: 12,
              color: theme.textMuted,
            }}
          >
            Guest-List privat (keine Namen)
          </Text>
        ) : null}

        {event.source_platform === 'LINKEDIN' && event.original_author_name ? (
          <View
            className="mt-3 rounded-2xl px-3 py-2.5"
            style={{ backgroundColor: 'rgba(10,102,194,0.08)' }}
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
