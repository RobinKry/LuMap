const { ModeSwitch, Button, BottomSheet, EventCard, MapPin } = window.LuMapDesignSystem_437202;

function StatusBar() {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 22px 0', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '.01em' }}>
      <span>21:04</span>
      <span style={{ display: 'flex', gap: 5, alignItems: 'center', opacity: .9 }}>
        <span style={{ fontSize: 11 }}>▮▮▮</span><span style={{ fontSize: 11 }}>◗</span><span style={{ fontSize: 11 }}>▰</span>
      </span>
    </div>
  );
}

function MapHome({ mode, setMode, events, selectedId, onSelect, onOpenSettings, sheetHeight, onCycleSheet }) {
  const visible = events.filter((e) => e.mode === mode);
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--surface-canvas)', overflow: 'hidden' }}>
      <MapCanvas mode={mode}>
        {visible.map((e) => (
          <div key={e.id} style={{ position: 'absolute', left: e.x + '%', top: e.y + '%', transform: 'translate(-50%,-50%)' }}>
            <MapPin kind={e.is_residential ? 'residential' : 'public'} selected={e.id === selectedId} onClick={() => onSelect(e.id)} />
          </div>
        ))}
      </MapCanvas>

      <div style={{ position: 'absolute', left: 0, right: 0, top: 0 }}>
        <StatusBar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 16px 0' }}>
          <Button variant="chrome" size="sm" onClick={onOpenSettings}>Settings</Button>
          <ModeSwitch mode={mode} onChange={setMode} />
        </div>
      </div>

      <BottomSheet title="Live Radar" subtitle={`${visible.length} events · ${mode}`} height={sheetHeight}>
        <div onClick={onCycleSheet} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-card)' }}>
          {visible.map((e) => (
            <EventCard
              key={e.id}
              event={e}
              selected={e.id === selectedId}
              onSelect={() => onSelect(e.id)}
              onOpenLink={() => {}}
            />
          ))}
          {visible.length === 0 && (
            <div style={{ marginTop: 24, textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>No events for {mode} yet.</div>
          )}
        </div>
      </BottomSheet>
    </div>
  );
}

Object.assign(window, { MapHome, StatusBar });
