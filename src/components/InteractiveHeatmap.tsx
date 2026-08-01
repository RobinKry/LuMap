import Mapbox, {
  Camera,
  LocationPuck,
  MapView,
  MarkerView,
  locationManager,
} from '@rnmapbox/maps'
import { Image } from 'expo-image'
import { useEffect, useMemo, useRef } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useAppTheme } from '../context/AppModeContext'
import { fonts, LM } from '../theme/tokens'
import type { EventItem } from '../types'
import { getBlurredCoordinates } from '../utils/privacyBlur'

const mapboxToken = process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? ''
Mapbox.setAccessToken(mapboxToken)

const BERLIN: [number, number] = [13.405, 52.52]
const MAX_PINS = 48
const PIN_SIZE = 40

type Props = {
  events: EventItem[]
  selectedEventId?: string | null
  onSelectEvent: (event: EventItem) => void
}

type PinModel = {
  event: EventItem
  coordinate: [number, number]
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
      coordinate: [coords.longitude, coords.latitude],
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
  const { theme } = useAppTheme()
  const cameraRef = useRef<Camera>(null)
  const didCenterOnUser = useRef(false)

  const pins = useMemo(() => buildPins(events), [events])

  useEffect(() => {
    let cancelled = false
    locationManager.setMinDisplacement(5)
    locationManager.start()

    const centerOnce = async () => {
      if (cancelled || didCenterOnUser.current) return
      try {
        const loc = await locationManager.getLastKnownLocation()
        if (cancelled || !loc?.coords) return
        const { longitude, latitude } = loc.coords
        if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return
        didCenterOnUser.current = true
        cameraRef.current?.setCamera({
          centerCoordinate: [longitude, latitude],
          zoomLevel: 12.5,
          animationDuration: 900,
        })
      } catch (error) {
        console.warn(
          '[map] user location unavailable, keeping Berlin',
          error instanceof Error ? error.message : error,
        )
      }
    }

    void centerOnce()
    const listener = () => {
      void centerOnce()
    }
    locationManager.addListener(listener)

    return () => {
      cancelled = true
      locationManager.removeListener(listener)
      locationManager.stop()
    }
  }, [])

  return (
    <View style={styles.fill}>
      <MapView
        style={styles.fill}
        styleURL={theme.mapStyle}
        compassEnabled={false}
        logoEnabled={false}
        attributionEnabled={false}
        scaleBarEnabled={false}
      >
        <Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: BERLIN,
            zoomLevel: 11.5,
          }}
        />

        <LocationPuck
          visible
          puckBearing="heading"
          puckBearingEnabled
          pulsing={{
            isEnabled: true,
            color: LM.mint300,
            radius: 'accuracy',
          }}
        />

        {pins.map((pin) => (
          <MarkerView
            key={pin.event.id}
            coordinate={pin.coordinate}
            allowOverlap
            allowOverlapWithPuck
            anchor={{ x: 0.5, y: 0.5 }}
            isSelected={selectedEventId === pin.event.id}
          >
            <EventLogoPin
              pin={pin}
              selected={selectedEventId === pin.event.id}
              onPress={() => onSelectEvent(pin.event)}
            />
          </MarkerView>
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
    right: -5,
    bottom: -3,
    minWidth: 18,
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    borderRadius: 999,
    backgroundColor: LM.ink900,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeSelected: {
    backgroundColor: LM.lilac500,
  },
  countBadgeText: {
    fontFamily: fonts.uiBold,
    fontSize: 9,
    lineHeight: 12,
    color: '#FFFFFF',
  },
})
