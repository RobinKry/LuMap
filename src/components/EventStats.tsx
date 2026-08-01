import type { LumaEvent } from '../types/event'
import './EventStats.css'

type Props = {
  overlap: LumaEvent['overlap']
  compact?: boolean
}

export function EventStats({ overlap, compact = false }: Props) {
  return (
    <ul className={`event-stats${compact ? ' event-stats--compact' : ''}`}>
      <li>
        <span className="event-stats__value">{overlap.attendees}</span>
        <span className="event-stats__label">dabei</span>
      </li>
      <li>
        <span className="event-stats__value">{overlap.pastEventMatches}</span>
        <span className="event-stats__label">schon getroffen</span>
      </li>
      <li>
        <span className="event-stats__value">{overlap.linkedInContacts}</span>
        <span className="event-stats__label">LinkedIn</span>
      </li>
    </ul>
  )
}
