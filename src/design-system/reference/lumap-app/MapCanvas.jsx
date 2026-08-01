// Stand-in for the map canvas. The real app renders Mapbox; no token is
// available here, so this is a pastel paper map at the same value range.
// Do not treat it as brand artwork.
const blocks = [
  { l: 3, t: 4, w: 17, h: 11 }, { l: 23, t: 3, w: 14, h: 9 }, { l: 40, t: 5, w: 19, h: 10 },
  { l: 63, t: 2, w: 15, h: 12 }, { l: 82, t: 6, w: 16, h: 9 },
  { l: 2, t: 19, w: 15, h: 13 }, { l: 21, t: 17, w: 18, h: 11, k: 'p' }, { l: 43, t: 20, w: 13, h: 10 },
  { l: 60, t: 18, w: 20, h: 13 }, { l: 84, t: 21, w: 14, h: 11 },
  { l: 4, t: 37, w: 19, h: 12 }, { l: 27, t: 35, w: 14, h: 10 }, { l: 46, t: 38, w: 17, h: 11, k: 'p' },
  { l: 68, t: 36, w: 15, h: 13 }, { l: 87, t: 39, w: 12, h: 10 },
  { l: 3, t: 62, w: 16, h: 12 }, { l: 23, t: 64, w: 19, h: 10 }, { l: 47, t: 61, w: 14, h: 13 },
  { l: 65, t: 65, w: 18, h: 11, k: 'p' }, { l: 86, t: 62, w: 13, h: 12 },
  { l: 8, t: 80, w: 18, h: 12 }, { l: 32, t: 82, w: 15, h: 10 }, { l: 55, t: 79, w: 20, h: 13 },
  { l: 79, t: 83, w: 16, h: 11 },
];

function MapCanvas({ mode, children }) {
  const water = mode === 'WORK' ? '#D8E4FF' : '#D6F0E4';
  const park = mode === 'WORK' ? '#DDF2E9' : '#FBEDC9';
  const paper = mode === 'WORK' ? '#E4E9F7' : '#F2E7DA';
  const road = 'rgba(255,255,255,0.95)';
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: paper }}>
      <div style={{ position: 'absolute', left: '-16%', top: '50%', width: '134%', height: 62, background: water, transform: 'rotate(-6deg)', borderRadius: 40 }} />
      {[[8, 6], [30, -4], [53, 5], [76, -3]].map(([t, r], i) => (
        <div key={'h' + i} style={{ position: 'absolute', left: '-12%', top: t + '%', width: '134%', height: i % 2 ? 6 : 9, background: road, transform: `rotate(${r}deg)` }} />
      ))}
      {[[18, 4], [41, -5], [58, 3], [81, -4]].map(([l, r], i) => (
        <div key={'v' + i} style={{ position: 'absolute', left: l + '%', top: '-12%', height: '134%', width: i % 2 ? 6 : 9, background: road, transform: `rotate(${r}deg)` }} />
      ))}
      {blocks.map((b, i) => (
        <div key={i} style={{
          position: 'absolute', left: b.l + '%', top: b.t + '%', width: b.w + '%', height: b.h + '%',
          background: b.k === 'p' ? park : 'var(--lm-paper-white)',
          borderRadius: 8, opacity: 0.92,
        }} />
      ))}
      {children}
    </div>
  );
}

Object.assign(window, { MapCanvas });
