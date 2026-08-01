function LuMapApp() {
  const [mode, setMode] = React.useState('WORK');
  const [selectedId, setSelectedId] = React.useState('luma-1');
  const [settings, setSettings] = React.useState(false);
  const [sheet, setSheet] = React.useState('54%');

  const cycle = () => setSheet((h) => (h === '54%' ? '78%' : h === '78%' ? '30%' : '54%'));

  return (
    <div data-mode={mode.toLowerCase()} style={{ position: 'relative', width: 390, height: 844, borderRadius: 44, overflow: 'hidden', background: 'var(--surface-canvas)', boxShadow: '0 40px 100px rgba(36,30,51,.22), 0 0 0 10px #efeaf6, 0 0 0 11px rgba(36,30,51,.14)' }}>
      <MapHome
        mode={mode} setMode={setMode}
        events={feedEvents}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onOpenSettings={() => setSettings(true)}
        sheetHeight={sheet}
        onCycleSheet={undefined}
      />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, transform: settings ? 'translateY(0)' : 'translateY(100%)', transition: 'transform var(--dur-sheet) var(--ease-spring)', pointerEvents: settings ? 'auto' : 'none' }}>
        <SettingsScreen onClose={() => setSettings(false)} />
      </div>
      <div style={{ position: 'absolute', left: '50%', bottom: 8, transform: 'translateX(-50%)', width: 134, height: 5, borderRadius: 999, background: 'var(--lm-alpha-30)', pointerEvents: 'none' }} />
      <button onClick={cycle} title="Cycle sheet snap point" style={{ position: 'absolute', right: 14, bottom: 26, width: 34, height: 34, borderRadius: 999, border: '1px solid var(--border-strong)', background: 'var(--surface-chrome)', backdropFilter: 'var(--blur-backdrop)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 13 }}>↕</button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<LuMapApp />);
