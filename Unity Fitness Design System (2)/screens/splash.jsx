// Splash screen preview — Unity Fitness
// Animated light pillar + staggered logo / wordmark / tagline reveal.
// Matches expo-edits/app/splash.tsx; uses CSS keyframes for the entry
// choreography since this is the HTML mockup.

function SplashScreen({ width = 360, height = 740 }) {
  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, []);

  // Replay key forces a fresh CSS-animation run each time the artboard
  // is opened or focused. The user clicks "Replay" to re-trigger.
  const [replayKey, setReplayKey] = React.useState(0);

  return (
    <div
      key={replayKey}
      style={{
        width, height,
        position: 'relative', overflow: 'hidden',
        background: '#0E0A1F',
        fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <style>{`
        @keyframes uf-pillar-in {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes uf-pillar-breath {
          0%, 100% { filter: brightness(0.92); }
          50%      { filter: brightness(1.12); }
        }
        @keyframes uf-logo-in {
          from { opacity: 0; transform: scale(0.7); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes uf-word-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes uf-tag-in {
          from { opacity: 0; }
          to   { opacity: 0.65; }
        }
      `}</style>

      {/* Pillar layer — fades in, then breathes forever */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        animation: 'uf-pillar-in 1100ms cubic-bezier(0.22, 1, 0.36, 1) both, uf-pillar-breath 7200ms ease-in-out 1100ms infinite',
        transformOrigin: 'center',
      }}>
        <LightPillar width={width} height={height} seed="A" />
      </div>

      {/* Bottom vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 90% 60% at 50% 110%, transparent 0%, rgba(14,10,31,0.65) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Content — logo + wordmark + tagline */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '0 24px',
      }}>
        {/* Logo */}
        <div style={{
          opacity: 0,
          animation: 'uf-logo-in 600ms cubic-bezier(0.22, 1, 0.36, 1) 1100ms both',
        }}>
          <UFLogoU size={88} />
        </div>

        {/* Wordmark */}
        <div style={{
          fontSize: 24, fontWeight: 900,
          color: '#FFFFFF', letterSpacing: 6,
          marginTop: 24, marginBottom: 10,
          opacity: 0,
          animation: 'uf-word-in 500ms cubic-bezier(0.22, 1, 0.36, 1) 1700ms both',
        }}>
          UNITYFITNESS
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: 13, color: 'rgba(255,255,255,0.65)',
          letterSpacing: 0.5, fontWeight: 500,
          opacity: 0,
          animation: 'uf-tag-in 600ms cubic-bezier(0.22, 1, 0.36, 1) 2200ms both',
        }}>
          Train anywhere · Pay for what you use
        </div>
      </div>

      {/* Replay button (mockup affordance) */}
      <button
        onClick={() => setReplayKey((k) => k + 1)}
        style={{
          position: 'absolute', bottom: 28, right: 20, zIndex: 5,
          background: 'rgba(255,255,255,0.12)',
          color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.2)',
          padding: '7px 14px', borderRadius: 999,
          fontSize: 11, fontWeight: 600, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontFamily: 'inherit',
        }}
      >
        <i data-lucide="rotate-cw" style={{ width: 12, height: 12 }} />
        Replay
      </button>
    </div>
  );
}

window.SplashScreen = SplashScreen;
