// Profile screen — Unity Fitness (dark mode w/ light pillar hero)

function Row({ icon, label, value, badge, toggle, danger, last }) {
  const PRIMARY = '#9f99c7';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 14px',
      borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: 'rgba(159,153,199,0.14)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <i data-lucide={icon} style={{ width: 18, height: 18, color: danger ? '#FF6B6B' : PRIMARY }} />
      </div>
      <div style={{
        flex: 1, fontSize: 15, color: danger ? '#FF6B6B' : '#FFFFFF',
        fontWeight: 600,
      }}>{label}</div>
      {value && (
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{value}</div>
      )}
      {badge !== undefined && (
        <div style={{
          minWidth: 22, height: 22, borderRadius: 999,
          background: '#E94B5C', color: '#FFFFFF',
          fontSize: 12, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 7px',
        }}>{badge}</div>
      )}
      {toggle !== undefined && (
        <div style={{
          width: 44, height: 24, borderRadius: 999,
          background: toggle ? '#9f99c7' : 'rgba(255,255,255,0.15)',
          position: 'relative', flexShrink: 0,
        }}>
          <div style={{
            position: 'absolute', top: 2,
            left: toggle ? 22 : 2,
            width: 20, height: 20, borderRadius: 999,
            background: '#FFFFFF',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            transition: 'left 0.2s',
          }} />
        </div>
      )}
      {!toggle && badge === undefined && !danger && (
        <i data-lucide="chevron-right" style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.4)' }} />
      )}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '20px 4px 12px',
    }}>
      <div style={{ width: 8, height: 8, borderRadius: 999, background: '#9f99c7' }} />
      <span style={{
        fontSize: 14, fontWeight: 800, color: '#9f99c7', letterSpacing: 0.3,
      }}>{children}</span>
    </div>
  );
}

function Card({ children }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      borderRadius: 16,
      border: '1px solid rgba(255,255,255,0.06)',
      overflow: 'hidden',
    }}>
      {children}
    </div>
  );
}

function TabBarItem({ icon, label, active }) {
  const c = active ? '#9f99c7' : 'rgba(255,255,255,0.5)';
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 4, paddingTop: 4,
    }}>
      <i data-lucide={icon} style={{ width: 22, height: 22, color: c }} />
      <span style={{ fontSize: 11, color: c, fontWeight: active ? 700 : 500 }}>{label}</span>
    </div>
  );
}

function ProfileScreen({ width = 360, height = 740 }) {
  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });

  return (
    <div style={{
      width, height, background: '#13121C',
      fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {/* ─── Hero (dark + light pillar) ───────────────── */}
        <div style={{
          padding: '24px 20px 22px',
          position: 'relative', overflow: 'hidden',
          background: '#0E0A1F',
          borderBottomLeftRadius: 22, borderBottomRightRadius: 22,
        }}>
          {/* Light pillar fills hero */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <LightPillar width={width} height={220} seed="B" />
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            position: 'relative', zIndex: 2,
          }}>
            <div style={{
              width: 60, height: 60, borderRadius: 999,
              background: 'rgba(255,255,255,0.18)',
              border: '1.5px solid rgba(255,255,255,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(4px)',
            }}>
              <i data-lucide="user" style={{ width: 30, height: 30, color: '#FFFFFF' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 18, fontWeight: 900, color: '#FFFFFF',
                letterSpacing: -0.3,
              }}>
                Zakaria Lembarki
              </div>
              <div style={{
                fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2,
              }}>
                zakaria.lembarki@gmail.com
              </div>
            </div>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i data-lucide="pencil" style={{ width: 16, height: 16, color: '#FFFFFF' }} />
            </div>
          </div>

          {/* Loyalty progress */}
          <div style={{ marginTop: 18, position: 'relative', zIndex: 2 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'baseline', marginBottom: 6,
            }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.92)', fontWeight: 600 }}>
                Loyalty Points
              </span>
              <span style={{ fontSize: 14, color: '#FFFFFF', fontWeight: 800 }}>24 pts</span>
            </div>
            <div style={{
              height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.22)',
              overflow: 'hidden',
            }}>
              <div style={{
                width: '24%', height: '100%', borderRadius: 999, background: '#FFFFFF',
              }} />
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 6 }}>
              Earn 76 more points for a free check-in
            </div>
          </div>
        </div>

        {/* ─── Sections ─────────────────────────────────── */}
        <div style={{ padding: '0 16px 24px' }}>
          <SectionLabel>General</SectionLabel>
          <Card>
            <Row icon="user" label="Profile" />
            <Row icon="map-pin" label="My Addresses" />
            <Row icon="languages" label="Language" />
            <Row icon="moon" label="Dark Mode" toggle={true} />
            <Row icon="bell" label="Notifications" badge="3" last />
          </Card>

          <SectionLabel>Promotions &amp; Rewards</SectionLabel>
          <Card>
            <Row icon="ticket" label="My Coupons" badge="2" />
            <Row icon="gift" label="Rewards" />
            <Row icon="credit-card" label="Payment Methods" last />
          </Card>

          <SectionLabel>Earn With Us</SectionLabel>
          <Card>
            <Row icon="users" label="Refer &amp; Earn" />
            <Row icon="navigation" label="Become a Partner Driver" />
            <Row icon="building-2" label="List Your Restaurant" last />
          </Card>

          <SectionLabel>Help &amp; Support</SectionLabel>
          <Card>
            <Row icon="info" label="About" />
            <Row icon="file-text" label="Terms &amp; Conditions" />
            <Row icon="shield" label="Privacy Policy" last />
          </Card>

          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '14px 28px', borderRadius: 999,
              background: 'rgba(159,153,199,0.1)',
              border: '1px solid rgba(159,153,199,0.3)',
            }}>
              <i data-lucide="log-out" style={{ width: 16, height: 16, color: '#9f99c7' }} />
              <span style={{ fontSize: 14, color: '#9f99c7', fontWeight: 700 }}>
                Sign Out
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Tab bar ─────────────────────────────────────── */}
      <div style={{
        background: '#13121C',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', padding: '10px 8px 12px',
        flexShrink: 0,
      }}>
        <TabBarItem icon="home" label="Home" />
        <TabBarItem icon="heart" label="Favorites" />
        <TabBarItem icon="shopping-bag" label="Orders" />
        <TabBarItem icon="menu" label="Menu" active />
      </div>
    </div>
  );
}

window.ProfileScreen = ProfileScreen;
