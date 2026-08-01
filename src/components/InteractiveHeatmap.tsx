import Mapbox, {
  Camera,
  CircleLayer,
  LocationPuck,
  MapView,
  ShapeSource,
  locationManager,
} from '@rnmapbox/maps'
import { useEffect, useMemo, useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import { useAppTheme } from '../context/AppModeContext'
import type { EventItem } from '../types'
import { getBlurredCoordinates } from '../utils/privacyBlur'

const mapboxToken = process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? ''
if (!mapboxToken) {
  console.warn(
    '[map] EXPO_PUBLIC_MAPBOX_TOKEN missing — set pk.* in .env.local and restart Metro',
  )
}
Mapbox.setAccessToken(mapboxToken)

const BERLIN: [number, number] = [13.405, 52.52]

type Props = {
  events: EventItem[]
  onSelectEvent: (event: EventItem) => void
}

type FeatureProps = {
  id: string
  kind: 'residential' | 'public'
  accent: string
}

function toFeatureCollection(events: EventItem[], accent: string) {
  const features = events
    .filter(
      (event) =>
        event.latitude != null &&
        event.longitude != null &&
        Number.isFinite(event.latitude) &&
        Number.isFinite(event.longitude),
    )
    .map((event) => {
      const isResidentialBlur = event.is_residential
      const coords = isResidentialBlur
        ? getBlurredCoordinates(event.latitude!, event.longitude!)
        : { latitude: event.latitude!, longitude: event.longitude! }

      return {
        type: 'Feature' as const,
        id: event.id,
        properties: {
          id: event.id,
          kind: isResidentialBlur ? 'residential' : 'public',
          accent,
        } satisfies FeatureProps,
        geometry: {
          type: 'Point' as const,
          coordinates: [coords.longitude, coords.latitude],
        },
      }
    })

  return {
    type: 'FeatureCollection' as const,
    features,
  }
}

export function InteractiveHeatmap({ events, onSelectEvent }: Props) {
  const { theme } = useAppTheme()
  const cameraRef = useRef<Camera>(null)
  const didCenterOnUser = useRef(false)

  const collection = useMemo(
    () => toFeatureCollection(events, theme.accent),
    [events, theme.accent],
  )

  const byId = useMemo(() => {
    const map = new Map<string, EventItem>()
    for (const event of events) map.set(event.id, event)
    return map
  }, [events])

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
            color: theme.accent,
            radius: 'accuracy',
          }}
        />

        <ShapeSource
          id="events-residential"
          shape={{
            type: 'FeatureCollection',
            features: collection.features.filter(
              (f) => f.properties.kind === 'residential',
            ),
          }}
          onPress={(e) => {
            const id = e.features?.[0]?.properties?.id as string | undefined
            const event = id ? byId.get(id) : undefined
            if (event) onSelectEvent(event)
          }}
        >
          <CircleLayer
            id="residential-glow-outer"
            style={{
              circleRadius: 42,
              circleColor: theme.accent,
              circleOpacity: 0.12,
              circleBlur: 0.8,
            }}
          />
          <CircleLayer
            id="residential-glow-inner"
            style={{
              circleRadius: 22,
              circleColor: theme.accent,
              circleOpacity: 0.28,
              circleBlur: 0.4,
            }}
          />
        </ShapeSource>

        <ShapeSource
          id="events-public"
          shape={{
            type: 'FeatureCollection',
            features: collection.features.filter(
              (f) => f.properties.kind === 'public',
            ),
          }}
          onPress={(e) => {
            const id = e.features?.[0]?.properties?.id as string | undefined
            const event = id ? byId.get(id) : undefined
            if (event) onSelectEvent(event)
          }}
        >
          <CircleLayer
            id="public-pulse-halo"
            style={{
              circleRadius: 16,
              circleColor: theme.accent,
              circleOpacity: 0.22,
            }}
          />
          <CircleLayer
            id="public-pulse-core"
            style={{
              circleRadius: 7,
              circleColor: theme.accent,
              circleStrokeWidth: 2,
              circleStrokeColor: '#FFFFFF',
              circleOpacity: 0.95,
            }}
          />
        </ShapeSource>
      </MapView>
    </View>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
})
