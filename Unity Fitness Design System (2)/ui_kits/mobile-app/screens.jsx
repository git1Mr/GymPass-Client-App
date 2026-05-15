/* global React */
const { useState, useEffect, useRef } = React;

// ─── Splash ───
const SplashScreen = ({ onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 1400); return () => clearTimeout(t); }, []);
  return (
    <div style={{ flex: 1, background: 'linear-gradient(180deg, #F7F6FB 0%, #1a1a2e 200%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -60, left: -60, width: 220, height: 220, borderRadius: 110, background: '#9f99c7', opacity: .35, filter: 'blur(20px)' }} />
      <div style={{ position: 'absolute', bottom: -80, right: -40, width: 240, height: 240, borderRadius: 120, background: '#3C0008', opacity: .25, filter: 'blur(28px)' }} />
      <div style={{ animation: 'splashIn .6s cubic-bezier(.2,.8,.2,1)', position: 'relative' }}><Logo size={96}/></div>
      <div style={{ font: '900 22px Inter', letterSpacing: 4, color: '#1A1728', marginTop: 18 }}><span style={{color:'#E8723F'}}>U</span>NITY FITNESS</div>
      <div style={{ font: '400 12px Inter', color: '#5C567A', marginTop: 4 }}>Train anywhere · Pay for what you use</div>
      <style>{`@keyframes splashIn { from { transform: scale(.6); opacity: 0 } to { transform: scale(1); opacity: 1 }}`}</style>
    </div>
  );
};

// ─── Login ───
const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('sami@example.com');
  const [pw, setPw] = useState('secret123');
  const [err, setErr] = useState('');
  const submit = () => {
    if (!email || !pw) { setErr('Please fill out both fields.'); return; }
    setErr('');
    onLogin();
  };
  return (
    <div style={{ flex: 1, background: '#F7F6FB', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        position: 'relative', borderBottomLeftRadius: 32, borderBottomRightRadius: 32, padding: '60px 28px 40px', overflow: 'hidden', isolation: 'isolate',
        background: 'radial-gradient(120% 80% at 0% 0%, #6B0010 0%, transparent 55%), radial-gradient(140% 90% at 100% 100%, #9f99c7 0%, transparent 60%), linear-gradient(135deg, #3C0008 0%, #1a0008 50%, #2a1238 100%)',
        boxShadow: '0 12px 28px rgba(60,0,8,0.30)'
      }}>
        <div style={{ position: 'absolute', inset: '-15%', background: 'conic-gradient(from 200deg at 60% 50%, rgba(255,220,200,0) 0deg, rgba(255,220,200,.18) 45deg, rgba(159,153,199,.25) 130deg, rgba(255,255,255,0) 240deg)', filter: 'blur(28px)', mixBlendMode: 'screen', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(28deg, rgba(255,255,255,.05) 0 1px, transparent 1px 6px), repeating-linear-gradient(-28deg, rgba(0,0,0,.10) 0 1px, transparent 1px 9px)', mixBlendMode: 'overlay', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Logo size={60}/>
          <div style={{ font: '900 30px/1.1 Inter', color: '#fff', marginTop: 18, letterSpacing: -.4, background: 'linear-gradient(180deg,#fff 0%, #f3d6db 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Welcome back !</div>
          <div style={{ font: '400 14px Inter', color: 'rgba(255,255,255,.75)', marginTop: 6 }}>Log In to go forward</div>
        </div>
      </div>
      <div style={{ padding: 24, flex: 1 }}>
        <FormInput label="EMAIL" value={email} onChange={setEmail} placeholder="you@example.com" icon="user" />
        <FormInput label="PASSWORD" value={pw} onChange={setPw} type="password" placeholder="••••••••" icon="lock" error={err} />
        <div style={{ textAlign: 'right', marginBottom: 18 }}>
          <button style={{ background: 'none', border: 'none', font: '500 13px Inter', color: '#3C0008', cursor: 'pointer' }}>Forgot password?</button>
        </div>
        <PrimaryButton label="Sign In" icon="arrow" onPress={submit} full />
        <div style={{ textAlign: 'center', font: '400 13px Inter', color: '#5C567A', marginTop: 22 }}>
          New here? <span style={{ color: '#3C0008', fontWeight: 700 }}>Create Account</span>
        </div>
      </div>
    </div>
  );
};

// ─── Home ───
const HomeScreen = ({ user, onAction, onShowQR }) => (
  <div style={{ flex: 1, background: '#F7F6FB', overflowY: 'auto' }}>
    <div style={{ background: '#fff', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #EDE8F4' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Logo size={30} />
        <div style={{ font: '900 16px Inter', color: '#1A1728', letterSpacing: 2.5 }}><span style={{color:'#E8723F'}}>U</span>NITY FITNESS</div>
      </div>
      <button style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}>
        <Icon name="bell" size={22} color="#3C0008" />
        <span style={{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, background: '#D93025', borderRadius: 4 }} />
      </button>
    </div>
    <div style={{ padding: 20 }}>
      <HeroCard greeting={`Hey ${user.firstName} 👋`} title={"Get all-in-one\naccess."} subtitle="Explore clubs, take classes, GymPass with one subscription." ctaLabel="Explore Clubs Near You" onCta={() => onAction('explore')} />
      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        <StatCard icon="zap" value={user.points} label="Points" />
        <StatCard icon="check" value={user.checkins} label="Check-ins" />
        <StatCard icon="star" value="Tier 2" label="Status" />
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
        <PillCard icon="qr" label="Generate Pass" onPress={onShowQR} />
        <PillCard icon="plus" label="Buy Points" onPress={() => onAction('plans')} />
        <PillCard icon="pin" label="Find Club" onPress={() => onAction('explore')} />
      </div>
      <div style={{
        position: 'relative', borderRadius: 22, padding: 20, marginTop: 16, color: '#fff',
        display: 'flex', alignItems: 'center', gap: 14, overflow: 'hidden', isolation: 'isolate',
        background: 'radial-gradient(120% 90% at 0% 0%, #f3d6db 0%, transparent 55%), radial-gradient(140% 100% at 100% 100%, #6B0010 0%, transparent 60%), linear-gradient(135deg, #9f99c7 0%, #7a73a8 100%)',
        boxShadow: '0 8px 22px rgba(60,0,8,.20), inset 0 1px 0 rgba(255,255,255,.22)'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(24deg, rgba(255,255,255,.08) 0 1px, transparent 1px 8px)', mixBlendMode: 'overlay', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: 60, background: '#3C0008', opacity: .25 }} />
        <Icon name="gift" size={32} color="#fff" />
        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{ font: '900 16px Inter' }}>Discover our plans</div>
          <div style={{ font: '400 12px Inter', opacity: .85 }}>Buy points once · Use them everywhere</div>
        </div>
        <Icon name="arrow" size={20} color="#fff" />
      </div>
      <div style={{ font: '900 17px Inter', color: '#1A1728', marginTop: 22, marginBottom: 10 }}>Nearby clubs</div>
      {window.UF_DATA.gyms.slice(0, 3).map(g => <GymCard key={g.id} gym={g} />)}
    </div>
  </div>
);

// ─── Explore ───
const ExploreScreen = ({ onSelect }) => {
  const [tier, setTier] = useState(0);
  const [q, setQ] = useState('');
  const gyms = window.UF_DATA.gyms.filter(g => (tier === 0 || g.tier === tier) && g.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={{ flex: 1, background: '#F7F6FB', display: 'flex', flexDirection: 'column' }}>
      <Header title="Explore" subtitle={`${gyms.length} clubs nearby`} />
      <div style={{ padding: '14px 20px 6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #D8D6EE', borderRadius: 14, padding: '0 14px', height: 44, marginBottom: 12 }}>
          <Icon name="help" size={16} color="#A09CC0" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search clubs, classes…" style={{ flex: 1, border: 'none', outline: 'none', font: '400 14px Inter', color: '#1A1728', background: 'transparent' }} />
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {[{ v: 0, l: 'All' }, { v: 1, l: 'Tier 1' }, { v: 2, l: 'Tier 2' }, { v: 3, l: 'Tier 3' }].map(c => (
            <button key={c.v} onClick={() => setTier(c.v)} style={{ flexShrink: 0, padding: '8px 16px', borderRadius: 999, font: '600 13px Inter', cursor: 'pointer', border: 'none', background: tier === c.v ? '#3C0008' : '#fff', color: tier === c.v ? '#fff' : '#1A1728', boxShadow: tier === c.v ? 'none' : '0 2px 8px rgba(0,0,0,.04)' }}>{c.l}</button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 20px' }}>
        {gyms.map(g => <GymCard key={g.id} gym={g} onPress={onSelect} />)}
      </div>
    </div>
  );
};

// ─── Plans ───
const PlansScreen = () => {
  const [sel, setSel] = useState('mobility');
  const plan = window.UF_DATA.plans.find(p => p.id === sel);
  return (
    <div style={{ flex: 1, background: '#F7F6FB', display: 'flex', flexDirection: 'column' }}>
      <Header title="Plans" subtitle="Buy points once · Use them everywhere" />
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 110px' }}>
        {window.UF_DATA.plans.map(p => <PlanCard key={p.id} plan={p} selected={sel === p.id} onSelect={setSel} />)}
        <div style={{ background: 'rgba(159,153,199,.15)', borderRadius: 14, padding: 14, font: '400 12px/1.5 Inter', color: '#5C567A', display: 'flex', gap: 10 }}>
          <Icon name="info" size={16} color="#9f99c7" />
          Points never expire while your account is active. Cancel anytime.
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 78, background: '#fff', borderTop: '1px solid #D8D6EE', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 -4px 12px rgba(159,153,199,.18)' }}>
        <div>
          <div style={{ font: '700 13px Inter', color: '#5C567A' }}>{plan.name} pack</div>
          <div style={{ font: '900 22px Inter', color: '#1A1728' }}>{plan.price} <span style={{ font: '500 13px Inter', color: '#5C567A' }}>MAD</span></div>
        </div>
        <PrimaryButton label="Buy now" icon="arrow" />
      </div>
    </div>
  );
};

// ─── Profile ───
const ProfileScreen = ({ user }) => {
  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 22 }}>
      <div style={{ font: '700 11px Inter', color: '#A09CC0', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 10 }}>{title}</div>
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #D8D6EE', overflow: 'hidden' }}>{children}</div>
    </div>
  );
  const Row = ({ icon, label, value, danger, last }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 14px', borderBottom: last ? 'none' : '1px solid #D8D6EE' }}>
      <div style={{ width: 34, height: 34, borderRadius: 8, background: danger ? '#FFE9E8' : 'rgba(60,0,8,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={16} color={danger ? '#D93025' : '#3C0008'} />
      </div>
      <div style={{ flex: 1, font: '600 14px Inter', color: danger ? '#D93025' : '#1A1728' }}>{label}</div>
      {value && <div style={{ font: '400 13px Inter', color: '#A09CC0' }}>{value}</div>}
      {!danger && <Icon name="chev" size={16} color="#9f99c7" />}
    </div>
  );
  return (
    <div style={{ flex: 1, background: '#F7F6FB', overflowY: 'auto' }}>
      <Header title="Profile" />
      <div style={{ padding: '20px 20px 30px' }}>
        <div style={{
          position: 'relative', borderRadius: 32, padding: 28, color: '#fff', overflow: 'hidden', isolation: 'isolate',
          display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20,
          background: 'radial-gradient(120% 90% at 0% 0%, #f3d6db 0%, transparent 55%), radial-gradient(140% 100% at 100% 100%, #6B0010 0%, transparent 60%), linear-gradient(135deg, #9f99c7 0%, #cfc8e8 40%, #7a73a8 100%)',
          boxShadow: '0 12px 28px rgba(60,0,8,0.20), inset 0 1px 0 rgba(255,255,255,.25)'
        }}>
          <div style={{ position: 'absolute', inset: '-15%', background: 'conic-gradient(from 180deg at 65% 35%, rgba(255,255,255,0) 0deg, rgba(255,255,255,.45) 30deg, rgba(255,255,255,0) 90deg, rgba(243,214,219,.35) 220deg, rgba(255,255,255,0) 360deg)', filter: 'blur(20px)', mixBlendMode: 'screen', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(24deg, rgba(255,255,255,.08) 0 1px, transparent 1px 8px), repeating-linear-gradient(-24deg, rgba(60,0,8,.10) 0 1px, transparent 1px 11px)', mixBlendMode: 'overlay', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: -44, right: -44, width: 140, height: 140, borderRadius: 70, background: 'radial-gradient(circle at 30% 30%, #6B0010 0%, #3C0008 60%, #1a0008 100%)', boxShadow: 'inset -8px -10px 22px rgba(0,0,0,.4)', opacity: .85 }} />
          <div style={{ width: 64, height: 64, borderRadius: 32, background: '#F7F6FB', color: '#3C0008', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '900 26px Inter', position: 'relative', zIndex: 1, boxShadow: '0 4px 12px rgba(0,0,0,.18)' }}>{user.firstName[0]}{user.lastName[0]}</div>
          <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
            <div style={{ font: '900 19px Inter' }}>{user.firstName} {user.lastName}</div>
            <div style={{ font: '400 12px Inter', opacity: .85 }}>{user.email}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,.18)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,.22)', padding: '3px 10px', borderRadius: 999, font: '700 11px Inter', marginTop: 6 }}><Icon name="zap" size={11} color="#fff" /> {user.points} pts</div>
          </div>
        </div>
        <Section title="GENERAL">
          <Row icon="wallet" label="My points" value={`${user.points} pts`} />
          <Row icon="store"  label="My address" value="Casablanca" />
          <Row icon="moon"   label="Dark mode" value="Off" />
          <Row icon="help"   label="Language" value="English" last />
        </Section>
        <Section title="MY CLUB">
          <Row icon="dumb"   label="Schedule a class" />
          <Row icon="check"  label="Check-in history" last />
        </Section>
        <Section title="ACCOUNT">
          <Row icon="cog"    label="Settings" />
          <Row icon="info"   label="About" />
          <Row icon="out"    label="Sign out" danger last />
        </Section>
        <div style={{ font: '400 11px Inter', color: '#A09CC0', textAlign: 'center', marginTop: 6 }}>v1.0.0 · Made with ♥ in Morocco</div>
      </div>
    </div>
  );
};

// ─── QR Pass overlay ───
const QRPass = ({ onClose }) => {
  const [t, setT] = useState(10);
  useEffect(() => {
    const i = setInterval(() => setT(s => s <= 1 ? 10 : s - 1), 1000);
    return () => clearInterval(i);
  }, []);
  const urgent = t <= 3;
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 32, padding: 28, width: '100%', boxShadow: '0 8px 32px rgba(60,0,8,.3)', animation: urgent ? 'pulse 1s infinite' : 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ font: '900 18px Inter', color: '#1A1728' }}>Check in here</div>
          <button onClick={onClose} style={{ background: 'rgba(60,0,8,.12)', border: 'none', borderRadius: 999, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="close" size={16} color="#3C0008" />
          </button>
        </div>
        <div style={{ background: '#F7F6FB', borderRadius: 22, padding: 22, display: 'flex', justifyContent: 'center', marginBottom: 16, border: urgent ? '2px solid #D93025' : '2px solid transparent' }}>
          <svg width="180" height="180" viewBox="0 0 21 21" shapeRendering="crispEdges">
            {Array.from({ length: 21 * 21 }).map((_, i) => {
              const x = i % 21, y = Math.floor(i / 21);
              const corner = (cx, cy) => x >= cx && x < cx + 7 && y >= cy && y < cy + 7 && !(x >= cx + 1 && x < cx + 6 && y >= cy + 1 && y < cy + 6) || (x >= cx + 2 && x < cx + 5 && y >= cy + 2 && y < cy + 5);
              const inCorner = corner(0, 0) || corner(14, 0) || corner(0, 14);
              const fill = inCorner || ((x * 7 + y * 13 + (x ^ y)) % 3 === 0 && x > 7 && y < 14) || ((x + y) % 5 === 0 && x < 14 && y > 7);
              return fill ? <rect key={i} x={x} y={y} width="1" height="1" fill="#3C0008" /> : null;
            })}
          </svg>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(159,153,199,.2)', padding: '6px 12px', borderRadius: 999 }}>
            <Icon name="shield" size={14} color="#3C0008" />
            <span style={{ font: '700 11px Inter', color: '#3C0008' }}>End-to-end secured</span>
          </div>
          <div style={{ font: '900 14px Inter', color: urgent ? '#D93025' : '#3C0008' }}>{t}s</div>
        </div>
        <div style={{ font: '400 12px Inter', color: '#5C567A', textAlign: 'center' }}>One-time use · Auto-expires · Rotates every 10s</div>
      </div>
      <style>{`@keyframes pulse { 0%,100% {transform:scale(1)} 50% {transform:scale(1.04)} }`}</style>
    </div>
  );
};

Object.assign(window, { SplashScreen, LoginScreen, HomeScreen, ExploreScreen, PlansScreen, ProfileScreen, QRPass });
