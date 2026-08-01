import { isSupabaseConfigured } from '../lib/supabase'
import './SettingsPage.css'

export function SettingsPage() {
  return (
    <section className="settings-page">
      <header className="page-header">
        <p className="brand">LuMap</p>
        <h1>Einstellungen</h1>
        <p className="page-header__sub">
          Verbindungen und Präferenzen – Daten folgen später.
        </p>
      </header>

      <div className="settings-groups">
        <section className="settings-group">
          <h2>Konten</h2>
          <button type="button" className="settings-row" disabled>
            <span>Luma verbinden</span>
            <span className="settings-row__meta">Bald</span>
          </button>
          <button type="button" className="settings-row" disabled>
            <span>LinkedIn verbinden</span>
            <span className="settings-row__meta">Bald</span>
          </button>
        </section>

        <section className="settings-group">
          <h2>Backend</h2>
          <div className="settings-row settings-row--static">
            <span>Supabase</span>
            <span
              className={`settings-row__meta${isSupabaseConfigured ? ' is-ok' : ''}`}
            >
              {isSupabaseConfigured ? 'Verbunden' : 'Nicht konfiguriert'}
            </span>
          </div>
        </section>

        <section className="settings-group">
          <h2>Über</h2>
          <div className="settings-row settings-row--static">
            <span>Version</span>
            <span className="settings-row__meta">0.1.0 · Scaffold</span>
          </div>
        </section>
      </div>
    </section>
  )
}
