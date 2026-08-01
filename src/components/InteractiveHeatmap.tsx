import Mapbox, {
  Camera,
  CircleLayer,
  MapView,
  ShapeSource,
} from '@rnmapbox/maps'
import { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { useAppMode } from '../context/AppModeContext'
import type { EventItem } from '../types'
import { getBlurredCoordinates } from '../utils/privacyBlur'

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '')

type Props = {
  events: EventItem[]
  onSelectEvent: (event: EventItem) => void
}

type FeatureProps = {
  id: string
  kind: 'residential' | 'public'
  accent: string
}

function toFeatureCollection(
  events: EventItem[],
  mode: 'WORK' | 'PARTY',
  accent: string,
) {
  const features = events
    .filter(
      (event) =>
        event.latitude != null &&
        event.longitude != null &&
        Number.isFinite(event.latitude) &&
        Number.isFinite(event.longitude),
    )
    .map((event) => {
      const isResidentialBlur =
        event.is_residential && mode === 'PARTY'
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
  const { mode, theme } = useAppMode()

  const collection = useMemo(
    () => toFeatureCollection(events, mode, theme.accent),
    [events, mode, theme.accent],
  )

  const byId = useMemo(() => {
    const map = new Map<string, EventItem>()
    for (const event of events) map.set(event.id, event)
    return map
  }, [events])

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
          defaultSettings={{
            centerCoordinate: [13.405, 52.52],
            zoomLevel: 11.5,
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
