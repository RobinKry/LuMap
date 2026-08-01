const { Button, TextField, SectionLabel } = window.LuMapDesignSystem_437202;

function SettingsScreen({ onClose }) {
  const [url, setUrl] = React.useState('https://lu.ma/ai-builders-berlin');
  const [contacts, setContacts] = React.useState(0);
  const [status, setStatus] = React.useState(null);
  const [busy, setBusy] = React.useState(false);

  const run = (fn) => {
    setBusy(true); setStatus(null);
    setTimeout(() => { fn(); setBusy(false); }, 700);
  };

  const P = { fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-body)', color: 'var(--text-secondary)', margin: '0 0 12px' };

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--surface-canvas)', display: 'flex', flexDirection: 'column' }}>
      <StatusBar />
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', fontFamily: 'var(--font-ui)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-semibold)', letterSpacing: 'var(--tracking-display)', color: 'var(--text-primary)' }}>Einstellungen</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-ui)' }}>Fertig</button>
        </div>

        <SectionLabel style={{ marginBottom: 8 }}>LinkedIn</SectionLabel>
        <p style={P}>Desktop LinkedIn → Settings → Data privacy → Get a copy of your data → Connections → CSV hier hochladen. Kein Scraping.</p>
        <p style={{ ...P, color: 'var(--text-body)' }}>Importiert: {contacts} Kontakte</p>
        <Button block disabled={busy} style={{ marginBottom: 24 }}
          onClick={() => run(() => { setContacts(1284); setStatus('1284 Kontakte importiert · 37 Overlaps'); })}>
          Connections.csv hochladen
        </Button>

        <SectionLabel style={{ marginBottom: 8 }}>Luma</SectionLabel>
        <p style={P}>Öffentliche Event-URL einfügen. Guest-Namen nur wenn die Liste öffentlich ist.</p>
        <TextField value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://lu.ma/..." style={{ marginBottom: 12 }} />
        <Button block disabled={busy} style={{ marginBottom: 12 }}
          onClick={() => run(() => setStatus('Event gespeichert · 64 Gäste · Overlaps 9'))}>
          Luma-Event syncen
        </Button>
        <Button variant="ghost" block disabled={busy} style={{ marginBottom: 24 }}
          onClick={() => run(() => setStatus('Overlaps neu berechnet: 37'))}>
          Overlaps neu matchen
        </Button>

        {busy
          ? <div style={{ fontSize: 'var(--text-sm)', color: 'var(--accent)' }}>…</div>
          : status ? <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{status}</div> : null}

        <div style={{ marginTop: 32, fontSize: 'var(--text-xs)', color: 'var(--text-faint)' }}>
          Namens-Matches sind nicht verifiziert (Kollisionen möglich).
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SettingsScreen });
