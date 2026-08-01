import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { mockEvents } from '../data/mockEvents'
import { EventStats } from '../components/EventStats'
import 'leaflet/dist/leaflet.css'
import './MapPage.css'

const markerIcon = L.divIcon({
  className: 'event-marker',
  html: '<span class="event-marker__dot"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

function formatWhen(iso: string) {
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function MapPage() {
  const center: [number, number] = [52.52, 13.405]

  return (
    <section className="map-page">
      <header className="map-page__chrome">
        <p className="brand">LuMap</p>
        <p className="map-page__hint">{mockEvents.length} Events in der Nähe</p>
      </header>

      <MapContainer
        center={center}
        zoom={12}
        className="map-page__map"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap, &copy; CARTO'
        />
        {mockEvents.map((event) => (
          <Marker
            key={event.id}
            position={[event.lat, event.lng]}
            icon={markerIcon}
          >
            <Popup className="event-popup">
              <div className="event-popup__body">
                <h2>{event.title}</h2>
                <p className="event-popup__meta">
                  {formatWhen(event.startsAt)} · {event.venue}
                </p>
                <EventStats overlap={event.overlap} compact />
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </section>
  )
}
