// Home (Dashboard) screen — Unity Fitness
// Hero / quick actions / clubs / plans share the burgundy → lavender
// gradient + crosshatch texture look.

const HOME_GRADIENT = 'linear-gradient(118deg, #3C0008 0%, #2A0820 32%, #5A4D85 72%, #9f99c7 105%)';
const HOME_CROSSHATCH = `
  repeating-linear-gradient(45deg, transparent 0 5px, rgba(255,255,255,0.04) 5px 6px),
  repeating-linear-gradient(-45deg, transparent 0 5px, rgba(255,255,255,0.025) 5px 6px)
`;

function GradientSurface({ children, radius = 24, style = {}, dimmer = 0 }) {
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      borderRadius: radius,
      background: HOME_GRADIENT,
      border: '1px solid rgba(255,255,255,0.06)',
      boxShadow: '0 14px 28px rgba(60,0,8,0.18)',
      ...style,
    }}>
      {/* Texture overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: HOME_CROSSHATCH,
        pointerEvents: 'none',
      }} />
      {/* Optional inner darkening (used by hero) */}
      {dimmer > 0 && (
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,${dimmer}) 100%)`,
          pointerEvents: 'none',
        }} />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}

function UnityPill() {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 10px 5px 8px',
      borderRadius: 999,
      background: 'rgba(20,12,28,0.55)',
      border: '1px solid rgba(255,255,255,0.12)',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        width: 6, height: 6, borderRadius: 999,
        background: '#F0C5FF',
        boxShadow: '0 0 0 2px rgba(240,197,255,0.25)',
      }} />
      <span style={{
        fontSize: 10, fontWeight: 800, color: '#FFFFFF',
        letterSpacing: 0.6,
      }}>UNITYFITNESS</span>
    </div>
  );
}

function StatCard({ icon, value, label }) {
  return (
    <div style={{
      flex: 1, background: '#FFFFFF',
      border: '1px solid #EFECF7', borderRadius: 14,
      padding: '14px 8px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 999,
        background: 'rgba(60,0,8,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <i data-lucide={icon} style={{ width: 18, height: 18, color: '#3C0008' }} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: '#1A1728' }}>{value}</div>
      <div style={{ fontSize: 11, color: '#A09CC0' }}>{label}</div>
    </div>
  );
}

function QuickActionPill({ icon, label }) {
  return (
    <div style={{ flex: 1 }}>
      <GradientSurface radius={16} style={{ padding: '14px 6px' }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 6,
        }}>
          <i data-lucide={icon} style={{ width: 20, height: 20, color: '#FFFFFF' }} />
          <div style={{
            fontSize: 11, fontWeight: 700, color: '#FFFFFF',
            textAlign: 'center', whiteSpace: 'pre-line', lineHeight: 1.2,
          }}>{label}</div>
        </div>
      </GradientSurface>
    </div>
  );
}

function HomeScreen({ width = 360, height = 740 }) {
  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });

  return (
    <div style={{
      width, height, background: '#F7F6FB',
      fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* ─── Header ───────────────────────────────────────── */}
      <div style={{
        padding: '14px 20px', background: '#FFFFFF',
        borderBottom: '1px solid #EFECF7',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <UFLogoU size={32} />
          <div style={{
            fontSize: 15, fontWeight: 900, color: '#1A1728', letterSpacing: 3,
          }}>UNITYFITNESS</div>
        </div>
        <i data-lucide="user-circle" style={{ width: 26, height: 26, color: '#3C0008' }} />
      </div>

      <div style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
        padding: '16px',
      }}>
        {/* ─── Hero ─────────────────────────────────────── */}
        <GradientSurface radius={28} style={{ marginBottom: 16 }} dimmer={0.1}>
          <div style={{ padding: '22px 22px 24px', position: 'relative' }}>
            {/* Top-right pill */}
            <div style={{
              position: 'absolute', top: 16, right: 16, zIndex: 3,
            }}>
              <UnityPill />
            </div>

            <div style={{
              fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.78)',
              marginBottom: 10,
            }}>
              Hey Zakaria <span style={{ display: 'inline-block' }}>👋</span>
            </div>
            <div style={{
              fontSize: 30, fontWeight: 900, color: '#FFFFFF',
              lineHeight: 1.05, letterSpacing: -0.8, marginBottom: 12,
              maxWidth: 220,
            }}>
              Get all-in-one<br />access.
            </div>
            <div style={{
              fontSize: 13, color: 'rgba(255,255,255,0.78)',
              lineHeight: 1.5, marginBottom: 20, maxWidth: 240,
            }}>
              Explore clubs, take classes, UnityFitness with one subscription.
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#FFFFFF', padding: '11px 18px',
              borderRadius: 999, fontSize: 13, fontWeight: 700,
              color: '#1A1728',
              boxShadow: '0 6px 14px rgba(0,0,0,0.22)',
            }}>
              Explore Clubs Near You
              <i data-lucide="arrow-right" style={{ width: 14, height: 14 }} />
            </div>
          </div>
        </GradientSurface>

        {/* ─── Stats ─────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <StatCard icon="wallet" value="24" label="Points" />
          <StatCard icon="check-circle" value="—" label="Check-ins" />
          <StatCard icon="map-pin" value="12+" label="Gyms" />
        </div>

        {/* ─── Quick actions ─────────────────────────────── */}
        <div style={{
          fontSize: 14, fontWeight: 700, color: '#1A1728', marginBottom: 8,
        }}>Quick actions</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <QuickActionPill icon="qr-code" label={"Access\nAny Gym"} />
          <QuickActionPill icon="plus-circle" label="Buy Points" />
          <QuickActionPill icon="clock" label="History" />
        </div>

        {/* ─── Find clubs near you ───────────────────────── */}
        <GradientSurface radius={18} style={{ marginBottom: 16 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 16px',
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 999,
              background: 'rgba(255,255,255,0.16)',
              border: '1px solid rgba(255,255,255,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i data-lucide="map-pin" style={{ width: 18, height: 18, color: '#FFFFFF' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#FFFFFF' }}>
                Find clubs near you
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
                12 partner clubs within 10 km
              </div>
            </div>
            <i data-lucide="chevron-right" style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.7)' }} />
          </div>
        </GradientSurface>

        {/* ─── Discover plans banner ─────────────────────── */}
        <GradientSurface radius={18}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 10, padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 999,
                background: 'rgba(255,255,255,0.16)',
                border: '1px solid rgba(255,255,255,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <i data-lucide="zap" style={{ width: 18, height: 18, color: '#FFFFFF' }} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#FFFFFF' }}>
                  Discover our plans
                </div>
                <div style={{
                  fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2,
                }}>
                  Buy points once · Use them everywhere
                </div>
              </div>
            </div>
            <div style={{
              width: 36, height: 36, borderRadius: 999,
              background: 'rgba(255,255,255,0.16)',
              border: '1px solid rgba(255,255,255,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i data-lucide="arrow-right" style={{ width: 16, height: 16, color: '#FFFFFF' }} />
            </div>
          </div>
        </GradientSurface>
      </div>
    </div>
  );
}

window.HomeScreen = HomeScreen;
