/* global React */
const { useState, useEffect, useRef } = React;

// ─── Icons (Lucide via inline SVG, sized to match Ionicons cadence) ───
const Icon = ({ name, size = 20, color = "currentColor", strokeWidth = 1.9 }) => {
  const paths = {
    home:    'M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
    map:     'm3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v16M15 6v16',
    zap:     'M13 2 4 14h7l-1 8 9-12h-7z',
    user:    'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8m-7 9a7 7 0 0 1 14 0',
    qr:      'M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h3v3h-3zm5 0h2v2h-2zm-5 5h3v3h-3zm5 0h2v2h-2z',
    arrow:   'M5 12h14m-6-6 6 6-6 6',
    chev:    'm9 6 6 6-6 6',
    chevd:   'm6 9 6 6 6-6',
    pin:     'M12 22s8-7.5 8-13a8 8 0 1 0-16 0c0 5.5 8 13 8 13zm0-10a3 3 0 1 0 0-6 3 3 0 0 0 0 6',
    flash:   'M13 2 4 14h7l-1 8 9-12h-7z',
    check:   'M5 12.5l5 5 9-11',
    plus:    'M12 5v14M5 12h14',
    lock:    'M5 11h14v10H5zM8 11V8a4 4 0 0 1 8 0v3',
    shield:  'M12 3 4 6v6c0 5 4 8 8 9 4-1 8-4 8-9V6z M9 12l2 2 4-4',
    refresh: 'M3 12a9 9 0 0 1 15-6.7L21 8M21 4v4h-4M21 12a9 9 0 0 1-15 6.7L3 16M3 20v-4h4',
    bell:    'M6 8a6 6 0 0 1 12 0v5l2 3H4l2-3zm3 9a3 3 0 0 0 6 0',
    moon:    'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
    cog:     'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6m9-3-2.4-.4-.5-1.3 1.4-2-1.8-1.8-2 1.4-1.3-.5L14 4h-4l-.4 2.4-1.3.5-2-1.4L4.5 7.3l1.4 2-.5 1.3L3 11v4l2.4.4.5 1.3-1.4 2 1.8 1.8 2-1.4 1.3.5L10 22h4l.4-2.4 1.3-.5 2 1.4 1.8-1.8-1.4-2 .5-1.3z',
    help:    'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20m-1.5-7v.01M12 17v0M9 9a3 3 0 1 1 4 2.8c-.5.3-1 .9-1 1.7',
    out:     'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
    star:    'm12 2 3 7 7 .6-5.3 4.7L18 22l-6-3.6L6 22l1.3-7.7L2 9.6 9 9z',
    pencil:  'M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z',
    store:   'M3 9h18l-2-5H5zM4 9v11h16V9M9 14h6v6H9z',
    info:    'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20m0-11v6m0-9v.01',
    dumb:    'M2 12h2m18 0h-2M5 8v8M19 8v8M8 6v12M16 6v12',
    wallet:  'M3 7h18v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 7V5a2 2 0 0 1 2-2h12v4M17 13h2',
    plan:    'M4 5a2 2 0 0 1 2-2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM14 3v6h6M8 13h8M8 17h6',
    close:   'M6 6l12 12M18 6 6 18',
    gift:    'M20 7H4v5h16zM4 12v9h16v-9M12 7v14M9 7c0-2 1-4 3-4 1 1 0 4 0 4S6 7 9 7M15 7c0-2-1-4-3-4-1 1 0 4 0 4s6 0 3 0',
    eye:     'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12m10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6',
    eyeoff:  'M3 3l18 18M10.7 6.2A9 9 0 0 1 22 12c-.5.9-1.4 2.2-2.7 3.5M6.7 6.7C3.7 8.6 2 12 2 12s4 7 10 7c1.6 0 3-.4 4.3-1M9.9 14.1A3 3 0 0 1 14.1 9.9',
  };
  const d = paths[name] || paths.help;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {d.split(' M').map((p, i) => <path key={i} d={(i ? 'M' : '') + p} />)}
    </svg>
  );
};

// ─── Logo (custom U ribbon glyph) ───
const Logo = ({ size = 32, reverse = false, mono = false }) => {
  const id = 'lg' + Math.random().toString(36).slice(2, 7);
  const fill = mono ? (reverse ? '#3C0008' : '#fff') : `url(#${id})`;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={id} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#E8723F"/>
          <stop offset="50%" stopColor="#5E5070"/>
          <stop offset="100%" stopColor="#2C7A86"/>
        </linearGradient>
      </defs>
      <path d="M16 12 L16 58 Q16 86 50 86 Q84 86 84 58 L84 12 L70 12 L70 58 Q70 72 50 72 Q30 72 30 58 L30 12 Z" fill={fill}/>
    </svg>
  );
};

// ─── Header ───
const Header = ({ title, subtitle, right }) => (
  <div style={{ background: '#fff', borderBottom: '1px solid #D8D6EE', padding: '14px 24px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
    <div style={{ flex: 1 }}>
      <div style={{ font: '900 22px Inter', color: '#1A1728', letterSpacing: -.3 }}>{title}</div>
      {subtitle && <div style={{ font: '400 13px Inter', color: '#A09CC0', marginTop: 2 }}>{subtitle}</div>}
    </div>
    {right}
  </div>
);

// ─── Primary Button ───
const PrimaryButton = ({ label, onPress, icon, variant = 'accent', disabled, full }) => {
  const [pressed, setPressed] = useState(false);
  const bg = variant === 'accent' ? '#3C0008' : '#9f99c7';
  return (
    <button
      onMouseDown={() => setPressed(true)} onMouseUp={() => setPressed(false)} onMouseLeave={() => setPressed(false)}
      onClick={disabled ? null : onPress}
      style={{
        background: bg, color: '#fff', border: 'none', borderRadius: 999,
        padding: '14px 22px', font: '700 15px Inter', cursor: disabled ? 'default' : 'pointer',
        boxShadow: '0 4px 12px rgba(159,153,199,0.25)',
        opacity: disabled ? 0.45 : 1,
        transform: pressed ? 'scale(0.96)' : 'scale(1)', transition: 'transform .15s',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: full ? '100%' : 'auto',
      }}
    >
      {label}
      {icon && <Icon name={icon} size={16} color="#fff" />}
    </button>
  );
};

// ─── Form Input ───
const FormInput = ({ label, value, onChange, type = 'text', placeholder, error, icon }) => {
  const [focus, setFocus] = useState(false);
  const [show, setShow] = useState(false);
  const isPwd = type === 'password';
  const inputType = isPwd && show ? 'text' : type;
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <div style={{ font: '600 12px Inter', color: '#5C567A', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>{label}</div>}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: '#fff', border: `1.5px solid ${error ? '#D93025' : focus ? '#9f99c7' : '#D8D6EE'}`,
        borderRadius: 14, padding: '0 14px', height: 50,
      }}>
        {icon && <Icon name={icon} size={18} color="#5C567A" />}
        <input
          type={inputType} value={value} onChange={e => onChange?.(e.target.value)}
          placeholder={placeholder} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{ flex: 1, border: 'none', outline: 'none', font: '400 15px Inter', color: '#1A1728', background: 'transparent' }}
        />
        {isPwd && (
          <button onClick={() => setShow(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5C567A' }}>
            <Icon name={show ? 'eyeoff' : 'eye'} size={18} color="#5C567A" />
          </button>
        )}
      </div>
      {error && <div style={{ font: '400 12px Inter', color: '#D93025', marginTop: 4 }}>{error}</div>}
    </div>
  );
};

// ─── Stat Card ───
const StatCard = ({ icon, value, label }) => (
  <div style={{ flex: 1, background: '#fff', borderRadius: 14, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
    <div style={{ width: 36, height: 36, borderRadius: 18, background: 'rgba(60,0,8,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
      <Icon name={icon} size={18} color="#3C0008" />
    </div>
    <div style={{ font: '900 22px Inter', color: '#1A1728' }}>{value}</div>
    <div style={{ font: '400 11px Inter', color: '#A09CC0' }}>{label}</div>
  </div>
);

// ─── Pill Card (action shortcut) ───
const PillCard = ({ icon, label, onPress }) => (
  <button onClick={onPress} style={{ background: '#fff', border: '1px solid #D8D6EE', borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, boxShadow: '0 2px 8px rgba(0,0,0,.06)', cursor: 'pointer', flex: 1, minHeight: 88 }}>
    <Icon name={icon} size={20} color="#3C0008" />
    <span style={{ font: '600 11px Inter', color: '#1A1728', textAlign: 'center', lineHeight: 1.25 }}>{label}</span>
  </button>
);

// ─── Hero Card (silk burgundy/lavender) ───
const HeroCard = ({ greeting, title, subtitle, ctaLabel, onCta }) => (
  <div style={{
    position: 'relative', borderRadius: 32, padding: 28, color: '#fff', overflow: 'hidden', isolation: 'isolate',
    background: 'radial-gradient(120% 80% at 0% 0%, #f3d6db 0%, transparent 55%), radial-gradient(140% 90% at 100% 100%, #6B0010 0%, transparent 60%), linear-gradient(135deg, #9f99c7 0%, #7a73a8 50%, #3C0008 100%)',
    boxShadow: '0 12px 28px rgba(60,0,8,0.30), inset 0 1px 0 rgba(255,255,255,.18)',
  }}>
    <div style={{ position: 'absolute', inset: '-20%', background: 'conic-gradient(from 200deg at 65% 35%, rgba(255,255,255,0) 0deg, rgba(255,255,255,.45) 30deg, rgba(255,255,255,0) 90deg, rgba(243,214,219,.35) 220deg, rgba(255,255,255,0) 360deg)', filter: 'blur(22px)', mixBlendMode: 'screen', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(24deg, rgba(255,255,255,.07) 0 1px, transparent 1px 8px), repeating-linear-gradient(-24deg, rgba(0,0,0,.08) 0 1px, transparent 1px 11px)', mixBlendMode: 'overlay', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', top: -44, right: -44, width: 140, height: 140, borderRadius: 70, background: 'radial-gradient(circle at 30% 30%, #6B0010 0%, #3C0008 60%, #1a0008 100%)', boxShadow: 'inset -8px -10px 22px rgba(0,0,0,.45), inset 6px 8px 18px rgba(255,255,255,.18)', opacity: .9 }} />
    <div style={{ position: 'relative', zIndex: 1 }}>
      {greeting && <div style={{ font: '400 14px Inter', color: 'rgba(255,235,220,.85)', marginBottom: 4, letterSpacing: .3 }}>{greeting}</div>}
      <div style={{ font: '900 28px/1.08 Inter', marginBottom: 8, whiteSpace: 'pre-line', letterSpacing: -.3, background: 'linear-gradient(180deg,#fff 0%, #f3d6db 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{title}</div>
      {subtitle && <div style={{ font: '400 13px/1.4 Inter', color: 'rgba(255,255,255,.78)', marginBottom: 16, maxWidth: 240 }}>{subtitle}</div>}
      {ctaLabel && (
        <button onClick={onCta} style={{ background: '#fff', color: '#3C0008', border: 'none', borderRadius: 999, padding: '11px 18px', font: '700 13px Inter', display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,0,0,.30)' }}>
          {ctaLabel} <Icon name="arrow" size={14} color="#3C0008" />
        </button>
      )}
    </div>
  </div>
);

// ─── Plan Card ───
const PlanCard = ({ plan, selected, onSelect }) => {
  const tierColors = ['#9f99c7', '#F59E0B', '#3C0008'];
  return (
    <div onClick={() => onSelect?.(plan.id)} style={{
      position: 'relative', background: '#fff', borderRadius: 22, padding: 18, marginBottom: 14,
      border: `2px solid ${selected ? '#3C0008' : '#D8D6EE'}`,
      boxShadow: selected ? '0 8px 24px rgba(60,0,8,0.14), inset 0 0 0 1px rgba(255,255,255,.6)' : '0 2px 8px rgba(0,0,0,.04)',
      cursor: 'pointer', overflow: 'hidden', isolation: 'isolate',
      ...(selected && { background: 'radial-gradient(120% 90% at 0% 0%, rgba(243,214,219,.95) 0%, rgba(243,214,219,0) 55%), radial-gradient(140% 90% at 100% 100%, rgba(159,153,199,.55) 0%, rgba(159,153,199,0) 60%), linear-gradient(135deg, #fbeef1 0%, #f0eaf6 50%, #e9def0 100%)' }),
    }}>
      {selected && <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(24deg, rgba(255,255,255,.45) 0 1px, transparent 1px 7px), repeating-linear-gradient(-24deg, rgba(60,0,8,.06) 0 1px, transparent 1px 11px)', mixBlendMode: 'soft-light', pointerEvents: 'none' }} />}
      {plan.popular && (
        <div style={{ position: 'absolute', top: -12, right: 18, background: '#3C0008', color: '#fff', borderRadius: 999, padding: '4px 10px', font: '700 11px Inter' }}>Most Popular</div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ font: '900 20px Inter', color: '#1A1728' }}>{plan.name}</div>
          <div style={{ font: '400 12px Inter', color: '#A09CC0', marginTop: 2 }}>{plan.desc}</div>
        </div>
        <div style={{ background: 'rgba(60,0,8,.12)', borderRadius: 14, padding: '8px 12px', textAlign: 'center', minWidth: 64 }}>
          <div style={{ font: '900 22px Inter', color: '#3C0008', lineHeight: 1 }}>{plan.price}</div>
          <div style={{ font: '500 10px Inter', color: '#3C0008', marginTop: 2 }}>MAD</div>
        </div>
      </div>
      <div style={{ font: '500 12px Inter', color: '#5C567A', margin: '10px 0', display: 'flex', alignItems: 'center', gap: 4 }}>
        <Icon name="zap" size={12} color="#3C0008" /> {plan.points} pts · {(plan.price / plan.points).toFixed(2)} MAD/pt
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {plan.perTier.map(t => <span key={t} style={{ background: tierColors[t-1], color: '#fff', font: '700 10px Inter', padding: '3px 8px', borderRadius: 999 }}>Tier {t}</span>)}
      </div>
      <div style={{ position: 'relative' }}>
      {plan.perks.map((p, i) => (
        <div key={i} style={{ font: '400 13px Inter', color: '#5C567A', display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
          <Icon name="check" size={14} color="#3C0008" /> {p}
        </div>
      ))}
      </div>
    </div>
  );
};

// ─── Gym Card ───
const GymCard = ({ gym, onPress }) => {
  const tierColors = ['#9f99c7', '#F59E0B', '#3C0008'];
  return (
    <button onClick={() => onPress?.(gym)} style={{ width: '100%', textAlign: 'left', background: '#fff', border: '1px solid #D8D6EE', borderRadius: 18, padding: 14, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,.04)', marginBottom: 10 }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(159,153,199,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="dumb" size={22} color="#3C0008" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ font: '700 15px Inter', color: '#1A1728' }}>{gym.name}</span>
          <span style={{ background: tierColors[gym.tier-1], color: '#fff', font: '700 9px Inter', padding: '2px 7px', borderRadius: 999 }}>T{gym.tier}</span>
        </div>
        <div style={{ font: '400 12px Inter', color: '#A09CC0', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name="pin" size={11} color="#A09CC0" /> {gym.distance} km · {gym.address}
        </div>
      </div>
      <Icon name="chev" size={18} color="#9f99c7" />
    </button>
  );
};

// ─── Tab Bar ───
const TabBar = ({ active, onChange }) => {
  const tabs = [
    { id: 'home',    icon: 'home',  label: 'Home' },
    { id: 'explore', icon: 'map',   label: 'Explore' },
    { id: 'plans',   icon: 'zap',   label: 'Plans' },
    { id: 'profile', icon: 'user',  label: 'Profile' },
  ];
  return (
    <div style={{ background: '#fff', borderTop: '1px solid #D8D6EE', display: 'flex', padding: '6px 0 22px', justifyContent: 'space-around' }}>
      {tabs.map(t => {
        const on = active === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{ background: 'none', border: 'none', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, cursor: 'pointer', padding: 4 }}>
            <div style={{ width: 36, height: 36, borderRadius: 18, background: on ? 'rgba(159,153,199,.25)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={t.icon} size={20} color={on ? '#3C0008' : '#9f99c7'} strokeWidth={on ? 2.2 : 1.8} />
            </div>
            <span style={{ font: '600 10px Inter', color: on ? '#3C0008' : '#9f99c7' }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// ─── Bottom Sheet ───
const BottomSheet = ({ open, onClose, children }) => (
  <div style={{ position: 'absolute', inset: 0, pointerEvents: open ? 'auto' : 'none' }}>
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)', opacity: open ? 1 : 0, transition: 'opacity .3s' }} />
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      background: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32,
      padding: 24, transform: open ? 'translateY(0)' : 'translateY(100%)', transition: 'transform .35s cubic-bezier(.2,.8,.2,1)',
      boxShadow: '0 -8px 32px rgba(0,0,0,.15)',
    }}>
      <div style={{ width: 40, height: 4, borderRadius: 2, background: '#D8D6EE', margin: '0 auto 16px' }} />
      {children}
    </div>
  </div>
);

Object.assign(window, {
  Icon, Logo, Header, PrimaryButton, FormInput, StatCard, PillCard, HeroCard, PlanCard, GymCard, TabBar, BottomSheet,
});
