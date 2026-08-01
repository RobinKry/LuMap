import { Image } from 'expo-image'
import * as Location from 'expo-location'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import MapView, {
  Marker,
  PROVIDER_DEFAULT,
  type Region,
} from 'react-native-maps'
import { fonts, LM } from '../theme/tokens'
import type { EventItem } from '../types'
import { getBlurredCoordinates } from '../utils/privacyBlur'

const BERLIN: Region = {
  latitude: 52.52,
  longitude: 13.405,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
}
const MAX_PINS = 48
const PIN_SIZE = 40

type Props = {
  events: EventItem[]
  selectedEventId?: string | null
  onSelectEvent: (event: EventItem) => void
}

type PinModel = {
  event: EventItem
  coordinate: { latitude: number; longitude: number }
  logoUrl: string | null
  initial: string
}

function buildPins(events: EventItem[]): PinModel[] {
  const ranked = [...events].sort((a, b) => {
    const am = a.linkedin_match_count ?? 0
    const bm = b.linkedin_match_count ?? 0
    if (bm !== am) return bm - am
    return 0
  })
  const pins: PinModel[] = []
  for (const event of ranked) {
    if (
      event.latitude == null ||
      event.longitude == null ||
      !Number.isFinite(event.latitude) ||
      !Number.isFinite(event.longitude)
    ) {
      continue
    }
    const coords = event.is_residential
      ? getBlurredCoordinates(event.latitude, event.longitude)
      : { latitude: event.latitude, longitude: event.longitude }

    const logoUrl = event.cover_url?.trim() || null
    const initial = (event.host_name || event.title || '?')
      .trim()
      .charAt(0)
      .toUpperCase()

    pins.push({
      event,
      coordinate: {
        latitude: coords.latitude,
        longitude: coords.longitude,
      },
      logoUrl,
      initial: initial || '?',
    })
    if (pins.length >= MAX_PINS) break
  }
  return pins
}

function EventLogoPin({
  pin,
  selected,
  onPress,
}: {
  pin: PinModel
  selected: boolean
  onPress: () => void
}) {
  const matchCount = pin.event.linkedin_match_count
  const hasMatches =
    typeof matchCount === 'number' && Number.isFinite(matchCount) && matchCount > 0
  const attendeeCount = pin.event.attendee_count
  const showAttendeeBadge =
    typeof attendeeCount === 'number' &&
    Number.isFinite(attendeeCount) &&
    attendeeCount > 0

  return (
    <Pressable onPress={onPress} hitSlop={6}>
      <View style={styles.pinWrap}>
        <View
          style={[
            styles.pinOuter,
            hasMatches && styles.pinHasMatch,
            pin.event.is_residential && styles.pinResidential,
            selected && styles.pinSelected,
          ]}
        >
          {pin.logoUrl ? (
            <Image
              source={{ uri: pin.logoUrl }}
              style={styles.pinImage}
              contentFit="cover"
              transition={120}
            />
          ) : (
            <View style={styles.pinFallback}>
              <Text style={styles.pinInitial}>{pin.initial}</Text>
            </View>
          )}
        </View>
        {showAttendeeBadge ? (
          <View
            style={[
              styles.countBadge,
              selected && styles.countBadgeSelected,
            ]}
          >
            <Text style={styles.countBadgeText} numberOfLines={1}>
              {attendeeCount}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  )
}

export function InteractiveHeatmap({
  events,
  selectedEventId,
  onSelectEvent,
}: Props) {
  const mapRef = useRef<MapView>(null)
  const didCenterOnUser = useRef(false)
  const [tracksViewChanges, setTracksViewChanges] = useState(true)
  // Gate the system blue puck on when-in-use permission so MKMapView
  // actually lights it up after the prompt (not only at first mount).
  const [locationAllowed, setLocationAllowed] = useState(false)
  const pins = useMemo(() => buildPins(events), [events])

  useEffect(() => {
    // Custom marker images need a short track window, then freeze for perf.
    setTracksViewChanges(true)
    const t = setTimeout(() => setTracksViewChanges(false), 800)
    return () => clearTimeout(t)
  }, [pins, selectedEventId])

  useEffect(() => {
    let cancelled = false

    const enableUserLocation = async () => {
      if (cancelled || didCenterOnUser.current) return
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (cancelled || status !== 'granted') return

        // Turn on Apple Maps / Google blue user-location puck.
        setLocationAllowed(true)

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })
        if (cancelled) return
        const { longitude, latitude } = loc.coords
        if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return

        didCenterOnUser.current = true
        mapRef.current?.animateToRegion(
          {
            latitude,
            longitude,
            latitudeDelta: 0.045,
            longitudeDelta: 0.045,
          },
          900,
        )
      } catch (error) {
        console.warn(
          '[map] user location unavailable, keeping Berlin',
          error instanceof Error ? error.message : error,
        )
      }
    }

    void enableUserLocation()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <View style={styles.fill}>
      <MapView
        ref={mapRef}
        style={styles.fill}
        provider={PROVIDER_DEFAULT}
        initialRegion={BERLIN}
        showsUserLocation={locationAllowed}
        showsMyLocationButton={locationAllowed}
        followsUserLocation={false}
        showsCompass={false}
        showsPointsOfInterests
        mapType="standard"
        userInterfaceStyle="light"
        // MKMapView tints the system location puck from the view hierarchy
        // (tab accent is teal). Force iOS system blue for the puck only.
        tintColor="#007AFF"
      >
        {pins.map((pin) => (
          <Marker
            key={pin.event.id}
            coordinate={pin.coordinate}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={tracksViewChanges}
            onPress={() => onSelectEvent(pin.event)}
          >
            <EventLogoPin
              pin={pin}
              selected={selectedEventId === pin.event.id}
              onPress={() => onSelectEvent(pin.event)}
            />
          </Marker>
        ))}
      </MapView>
    </View>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  pinWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinOuter: {
    width: PIN_SIZE,
    height: PIN_SIZE,
    borderRadius: PIN_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: LM.lilac100,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    shadowColor: LM.ink900,
    shadowOpacity: 0.22,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  pinSelected: {
    borderColor: LM.lilac500,
    borderWidth: 3,
    transform: [{ scale: 1.08 }],
  },
  pinHasMatch: {
    borderColor: LM.linkedin,
  },
  pinResidential: {
    opacity: 0.88,
    borderStyle: 'dashed',
  },
  pinImage: {
    width: '100%',
    height: '100%',
  },
  pinFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LM.lilac500,
  },
  pinInitial: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: '#FFFFFF',
  },
  countBadge: {
    position: 'absolute',
    right: -7,
    bottom: -4,
    minWidth: 24,
    height: 24,
    paddingHorizontal: 5,
    borderRadius: 999,
    backgroundColor: LM.ink900,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeSelected: {
    backgroundColor: LM.lilac500,
  },
  countBadgeText: {
    fontFamily: fonts.uiBold,
    fontSize: 11,
    lineHeight: 13,
    color: '#FFFFFF',
  },
})
