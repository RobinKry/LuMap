import { mockEvents } from '../data/mockEvents'
import { EventStats } from '../components/EventStats'
import './ListPage.css'

function formatWhen(iso: string) {
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function ListPage() {
  const sorted = [...mockEvents].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  )

  return (
    <section className="list-page">
      <header className="page-header">
        <p className="brand">LuMap</p>
        <h1>Events</h1>
        <p className="page-header__sub">
          Wer geht hin – und wen kennst du schon?
        </p>
      </header>

      <ul className="event-list">
        {sorted.map((event) => (
          <li key={event.id} className="event-list__item">
            <div className="event-list__top">
              <h2>{event.title}</h2>
              <time dateTime={event.startsAt}>{formatWhen(event.startsAt)}</time>
            </div>
            <p className="event-list__venue">
              {event.venue} · {event.city}
            </p>
            <p className="event-list__host">Host: {event.host}</p>
            <EventStats overlap={event.overlap} />
          </li>
        ))}
      </ul>
    </section>
  )
}
