// Checked-in / QR screen — Unity Fitness
// Inspired by the Gympass "Checked in takes seconds" mock, with the
// pink swapped for the brand primary (#9f99c7 lavender).

// Static SVG QR code — purely decorative; renders deterministic-looking
// modules so we don't need an external library.
function FakeQR({ size = 220 }) {
  // 25×25 grid of pseudo-random modules (seeded so it always renders the same)
  const N = 25;
  const rng = (i) => {
    // Simple xorshift seeded by i, returns 0 or 1
    let x = (i + 1) * 2654435761 >>> 0;
    x ^= x << 13; x ^= x >> 17; x ^= x << 5;
    return (x >>> 0) % 7 < 4 ? 1 : 0;
  };

  const finder = (cx, cy) => (
    <>
      <rect x={cx} y={cy} width="7" height="7" rx="1.2" fill="#1A1728" />
      <rect x={cx + 1} y={cy + 1} width="5" height="5" rx="0.6" fill="#FFFFFF" />
      <rect x={cx + 2} y={cy + 2} width="3" height="3" rx="0.4" fill="#1A1728" />
    </>
  );

  // Helper to detect if (r,c) is inside any finder pattern
  const inFinder = (r, c) =>
    (r < 7 && c < 7) ||
    (r < 7 && c >= N - 7) ||
    (r >= N - 7 && c < 7);

  const cells = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (inFinder(r, c)) continue;
      if (rng(r * N + c)) {
        cells.push(
          <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#1A1728" />
        );
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox="0 0 25 25" shapeRendering="crispEdges"
         style={{ display: 'block' }}>
      <rect width="25" height="25" fill="#FFFFFF" />
      {cells}
      {finder(0, 0)}
      {finder(0, N - 7)}
      {finder(N - 7, 0)}
    </svg>
  );
}

function CheckedInScreen({ width = 360, height = 740 }) {
  const PRIMARY = '#9f99c7';
  const PRIMARY_DARK = '#7a73a8';
  const ACCENT = '#3C0008';

  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });

  return (
    <div style={{
      width, height,
      fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
      display: 'flex', flexDirection: 'column',
      background: '#0E0A1F',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Light pillar background (no circle blobs) */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <LightPillar width={width} height={height} seed="B" />
      </div>

      {/* ─── Top bar (close button) ───────────────────────── */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', justifyContent: 'flex-end',
        padding: '20px 20px 0',
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 999,
          background: 'rgba(255,255,255,0.16)',
          border: '1px solid rgba(255,255,255,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <i data-lucide="x" style={{ width: 18, height: 18, color: '#FFFFFF' }} />
        </div>
      </div>

      {/* ─── Headline ─────────────────────────────────────── */}
      <div style={{
        flex: 1, padding: '32px 28px 0', position: 'relative', zIndex: 2,
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '5px 12px', borderRadius: 999,
          background: 'rgba(255,255,255,0.22)',
          border: '1px solid rgba(255,255,255,0.3)',
          marginBottom: 14,
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: 999, background: '#5DEC9F',
            boxShadow: '0 0 0 3px rgba(93,236,159,0.25)',
          }} />
          <span style={{
            fontSize: 11, fontWeight: 700, color: '#FFFFFF',
            letterSpacing: 0.3,
          }}>LIVE PASS</span>
        </div>
        <div style={{
          fontSize: 40, fontWeight: 900, color: '#FFFFFF',
          letterSpacing: -1, lineHeight: 1.05,
        }}>
          Checked in
        </div>
        <div style={{
          fontSize: 14, color: 'rgba(255,255,255,0.82)',
          marginTop: 10, fontWeight: 500, maxWidth: 260,
        }}>
          Show this code at the front desk. It rotates every 10 seconds.
        </div>
      </div>

      {/* ─── Card stack ───────────────────────────────────── */}
      <div style={{
        padding: '24px 20px 24px', position: 'relative', zIndex: 2,
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {/* Gym card */}
        <div style={{
          background: '#FFFFFF', borderRadius: 18,
          padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 14,
          boxShadow: '0 12px 28px rgba(60,0,8,0.18)',
        }}>
          <div style={{
            width: 46, height: 46, borderRadius: 12,
            background: '#F4F0FB',
            border: '1px solid #E5DFF5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
          }}>
            <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
              <rect x="6" y="22" width="6" height="20" rx="1.5" fill={ACCENT} />
              <rect x="14" y="18" width="5" height="28" rx="1.5" fill={ACCENT} />
              <rect x="19" y="29" width="26" height="6" rx="1" fill={ACCENT} />
              <rect x="45" y="18" width="5" height="28" rx="1.5" fill={ACCENT} />
              <rect x="52" y="22" width="6" height="20" rx="1.5" fill={ACCENT} />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 15, fontWeight: 800, color: '#1A1728',
              letterSpacing: -0.2,
            }}>Iron Forge Casablanca</div>
            <div style={{
              fontSize: 12, color: '#5C567A', marginTop: 2,
            }}>Gym access · 2 pts</div>
          </div>
        </div>

        {/* QR card */}
        <div style={{
          background: '#FFFFFF', borderRadius: 22,
          padding: '14px 16px 22px',
          boxShadow: '0 12px 28px rgba(60,0,8,0.18)',
        }}>
          {/* Hide button */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 8, padding: '10px 0',
            borderBottom: '1px solid #EFECF7',
            marginBottom: 16,
          }}>
            <i data-lucide="scan-line" style={{ width: 16, height: 16, color: '#1A1728' }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1728' }}>
              Hide Code
            </span>
          </div>

          {/* QR */}
          <div style={{
            display: 'flex', justifyContent: 'center', padding: '4px 0 12px',
          }}>
            <FakeQR size={220} />
          </div>

          {/* Countdown footer */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(159,153,199,0.13)',
            padding: '10px 14px', borderRadius: 12,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 999,
              background: PRIMARY,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#FFFFFF', fontSize: 11, fontWeight: 800,
            }}>8s</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1728' }}>
                Secured pass
              </div>
              <div style={{ fontSize: 11, color: '#5C567A', marginTop: 1 }}>
                Rotates every 10s · One-time use
              </div>
            </div>
            <i data-lucide="shield-check" style={{ width: 16, height: 16, color: PRIMARY_DARK }} />
          </div>
        </div>
      </div>
    </div>
  );
}

window.CheckedInScreen = CheckedInScreen;
