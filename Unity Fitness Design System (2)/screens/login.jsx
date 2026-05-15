// Login screen — Unity Fitness
// Dark hero with vertical lavender "light pillar" SVG (no more circles).

const UFLogoU = ({ size = 88 }) => {
  const r = size * 0.24; // squircle-ish radius
  return (
    <div style={{
      width: size, height: size, borderRadius: r,
      position: 'relative',
      background: 'radial-gradient(circle at 28% 22%, #8A1A28 0%, #5A0010 45%, #2A0006 100%)',
      boxShadow:
        '0 14px 30px rgba(60,0,8,0.55), 0 4px 10px rgba(0,0,0,0.4),' +
        ' inset 0 2px 0 rgba(255,255,255,0.18),' +
        ' inset 0 -3px 8px rgba(0,0,0,0.4)',
      overflow: 'hidden',
    }}>
      {/* Top sheen */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '55%', borderRadius: `${r}px ${r}px 50% 50% / ${r}px ${r}px 30% 30%`,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Big white U */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width={size * 0.68} height={size * 0.68} viewBox="0 0 64 64" fill="none">
          <path
            d="M14 8 L14 38 C14 50 22 56 32 56 C42 56 50 50 50 38 L50 8 L38 8 L38 38 C38 44 36 47 32 47 C28 47 26 44 26 38 L26 8 Z"
            fill="#FFFFFF"
          />
        </svg>
      </div>

      {/* Top-right white dot */}
      <div style={{
        position: 'absolute',
        top: size * 0.12, right: size * 0.12,
        width: size * 0.14, height: size * 0.14,
        borderRadius: 999, background: '#FFFFFF',
        boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
      }} />
    </div>
  );
};

const IonIcon = ({ name, size = 18, color = '#5C567A' }) => (
  <i data-lucide={name} style={{ width: size, height: size, color, display: 'inline-block' }} />
);

function LoginScreen({ width = 360, height = 740 }) {
  const PRIMARY = '#9f99c7';
  const PRIMARY_DARK = '#7a73a8';
  const TEXT = '#1A1728';
  const TEXT_2 = '#5C567A';
  const BORDER = '#D8D6EE';

  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });

  return (
    <div style={{
      width, height, background: '#FFFFFF',
      fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* ─── Dark hero w/ light pillar ──────────────────────── */}
      <div style={{
        background: '#0E0A1F',
        paddingTop: 60, paddingBottom: 80,
        paddingLeft: 24, paddingRight: 24,
        position: 'relative', overflow: 'hidden',
        flexShrink: 0,
      }}>
        {/* Light pillar — absolute, fills the whole hero */}
        <div style={{
          position: 'absolute', inset: 0,
          pointerEvents: 'none',
        }}>
          <LightPillar width={width} height={420} seed="A" />
        </div>

        {/* Top vignette to deepen edges */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% 110%, transparent 0%, rgba(14,10,31,0.6) 100%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          position: 'relative', zIndex: 2,
          display: 'flex', justifyContent: 'center', marginTop: 8,
        }}>
          <UFLogoU size={92} />
        </div>

        <div style={{
          marginTop: 22, textAlign: 'center',
          position: 'relative', zIndex: 2,
        }}>
          <div style={{
            fontSize: 28, fontWeight: 900, color: '#FFFFFF',
            letterSpacing: -0.5, lineHeight: 1.1,
          }}>
            Welcome back !
          </div>
          <div style={{
            fontSize: 14, color: 'rgba(255,255,255,0.7)',
            marginTop: 8, fontWeight: 500,
          }}>
            Sign in to continue
          </div>
        </div>
      </div>

      {/* ─── Form panel ───────────────────────────────────────── */}
      <div style={{
        background: '#FFFFFF', flex: 1,
        borderTopLeftRadius: 32, borderTopRightRadius: 32,
        marginTop: -32, paddingTop: 32, paddingBottom: 28,
        paddingLeft: 24, paddingRight: 24,
        position: 'relative', zIndex: 3,
        boxShadow: '0 -8px 24px rgba(60,0,8,0.05)',
      }}>
        {/* Email field */}
        <div style={{ marginBottom: 18 }}>
          <div style={{
            fontSize: 13, fontWeight: 600, color: TEXT,
            marginBottom: 8,
          }}>Email</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            border: `1.5px solid ${BORDER}`, borderRadius: 14,
            padding: '12px 14px', background: '#FFFFFF',
          }}>
            <IonIcon name="mail" size={18} color={PRIMARY} />
            <div style={{
              flex: 1, fontSize: 14, color: TEXT, fontWeight: 500,
              background: '#F2EFFB', padding: '2px 6px',
              borderRadius: 4, margin: '-2px -6px',
            }}>
              zakaria.lembarki@gmail.com
            </div>
          </div>
        </div>

        {/* Password field */}
        <div style={{ marginBottom: 14 }}>
          <div style={{
            fontSize: 13, fontWeight: 600, color: TEXT,
            marginBottom: 8,
          }}>Password</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            border: `1.5px solid ${BORDER}`, borderRadius: 14,
            padding: '12px 14px', background: '#FFFFFF',
          }}>
            <IonIcon name="lock" size={18} color={PRIMARY} />
            <div style={{
              flex: 1, fontSize: 16, color: TEXT, letterSpacing: 2,
              background: '#F2EFFB', padding: '2px 6px',
              borderRadius: 4, margin: '-2px -6px',
            }}>
              •••••••••
            </div>
            <IonIcon name="eye" size={18} color={TEXT_2} />
          </div>
        </div>

        {/* Remember + forgot */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 22,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 22, height: 22, borderRadius: 6,
              background: PRIMARY, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <IonIcon name="check" size={14} color="#FFFFFF" />
            </div>
            <span style={{ fontSize: 13, color: TEXT, fontWeight: 500 }}>
              Remember me
            </span>
          </div>
          <span style={{
            fontSize: 13, color: PRIMARY_DARK, fontWeight: 600,
          }}>
            Forgot password?
          </span>
        </div>

        {/* Primary CTA */}
        <button style={{
          width: '100%', border: 'none', cursor: 'pointer',
          background: PRIMARY, color: '#FFFFFF',
          padding: '15px 16px', borderRadius: 14,
          fontSize: 15, fontWeight: 700,
          boxShadow: '0 8px 20px rgba(159,153,199,0.4)',
          fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          Sign In
          <IonIcon name="arrow-right" size={16} color="#FFFFFF" />
        </button>

        {/* OR divider */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          marginTop: 22, marginBottom: 18,
        }}>
          <div style={{ flex: 1, height: 1, background: BORDER }} />
          <span style={{ fontSize: 12, color: TEXT_2, fontWeight: 500 }}>OR</span>
          <div style={{ flex: 1, height: 1, background: BORDER }} />
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center', fontSize: 13, color: TEXT,
        }}>
          New to Unity Fitness?{' '}
          <span style={{ color: PRIMARY_DARK, fontWeight: 700 }}>
            Create Account
          </span>
        </div>
      </div>
    </div>
  );
}

window.LoginScreen = LoginScreen;
window.UFLogoU = UFLogoU;
