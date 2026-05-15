// LightPillar — Unity Fitness creative background.
//
// Composition:
//   1. Two main light pillars at offset angles (broad halo + glow + core)
//   2. 3-4 branching "veins" peeling off the main pillar
//   3. Floating sparkle particles with twinkle animations
//   4. Traveling vertical shimmer that sweeps up the pillar
//   5. Slight cool highlight (mint/cyan) at the brightest crossover
//
// Seeds:
//   "A" — top-right → bottom-left, longer canvas (used on splash + auth)
//   "B" — twin near-vertical streak, taller canvas (used on profile + QR)
//   "C" — wider, more horizontal-curving (used on home hero card)

function LightPillar({ width = 360, height = 320, seed = "A" }) {
  const CONFIGS = {
    A: {
      vbH: 380,
      main:   "M 320 -40 C 220 60, 340 220, 220 380",
      sub:    "M 240 -10 C 180 100, 250 220, 170 360",
      veins: [
        "M 300 60 C 320 90, 360 130, 380 200",
        "M 230 140 C 200 170, 170 200, 130 220",
        "M 280 280 C 310 300, 330 320, 350 360",
      ],
      sparkles: [
        { cx: 340, cy: 40, r: 1.8, delay: 0.2, dur: 3.4 },
        { cx: 290, cy: 110, r: 2.4, delay: 1.6, dur: 4.0 },
        { cx: 360, cy: 180, r: 1.4, delay: 0.8, dur: 2.8 },
        { cx: 220, cy: 200, r: 2.0, delay: 2.4, dur: 3.6 },
        { cx: 260, cy: 280, r: 1.6, delay: 1.2, dur: 3.0 },
        { cx: 320, cy: 310, r: 1.2, delay: 3.0, dur: 4.2 },
        { cx: 200, cy: 350, r: 1.8, delay: 0.4, dur: 3.8 },
      ],
      coolStop: { cx: 320, cy: 100, r: 80 },
    },
    B: {
      vbH: 460,
      main:   "M 220 -40 C 160 120, 260 220, 180 460",
      sub:    "M 280 -20 C 230 140, 310 260, 260 440",
      veins: [
        "M 210 60 C 180 90, 150 110, 110 130",
        "M 250 200 C 290 230, 310 270, 330 320",
        "M 200 300 C 170 330, 150 370, 130 420",
      ],
      sparkles: [
        { cx: 220, cy: 30, r: 1.6, delay: 0.6, dur: 3.2 },
        { cx: 180, cy: 100, r: 2.0, delay: 1.8, dur: 4.0 },
        { cx: 260, cy: 160, r: 1.4, delay: 0.2, dur: 2.8 },
        { cx: 240, cy: 240, r: 2.4, delay: 2.2, dur: 3.8 },
        { cx: 200, cy: 320, r: 1.6, delay: 1.0, dur: 3.4 },
        { cx: 280, cy: 380, r: 1.2, delay: 2.8, dur: 4.2 },
      ],
      coolStop: { cx: 220, cy: 120, r: 70 },
    },
    C: {
      vbH: 240,
      main:   "M 380 -20 C 280 80, 200 100, 60 180",
      sub:    "M 380 60 C 300 120, 220 130, 80 230",
      veins: [
        "M 320 30 C 340 60, 360 90, 380 120",
        "M 240 90 C 220 100, 180 110, 140 110",
        "M 160 160 C 140 180, 120 200, 100 220",
      ],
      sparkles: [
        { cx: 360, cy: 30, r: 1.6, delay: 0.2, dur: 3.0 },
        { cx: 300, cy: 60, r: 2.0, delay: 1.6, dur: 4.0 },
        { cx: 220, cy: 100, r: 1.4, delay: 0.8, dur: 2.6 },
        { cx: 160, cy: 140, r: 2.2, delay: 2.2, dur: 3.8 },
        { cx: 100, cy: 190, r: 1.6, delay: 1.2, dur: 3.4 },
        { cx: 60, cy: 220, r: 1.2, delay: 0.4, dur: 3.6 },
      ],
      coolStop: { cx: 280, cy: 90, r: 60 },
    },
  };

  const c = CONFIGS[seed] || CONFIGS.A;
  const gid = `lp-${seed}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 400 ${c.vbH}`}
      preserveAspectRatio="xMidYMid slice"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id={`${gid}-glow`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0"    stopColor="#bfbbdc" stopOpacity="0" />
          <stop offset="0.18" stopColor="#bfbbdc" stopOpacity="0.55" />
          <stop offset="0.50" stopColor="#9f99c7" stopOpacity="0.9" />
          <stop offset="0.82" stopColor="#7a73a8" stopOpacity="0.55" />
          <stop offset="1"    stopColor="#3C0008" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${gid}-cool`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0"    stopColor="#A8E1FF" stopOpacity="0" />
          <stop offset="0.5"  stopColor="#A8E1FF" stopOpacity="0.45" />
          <stop offset="1"    stopColor="#A8E1FF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${gid}-core`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0"    stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="0.25" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="0.55" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="0.85" stopColor="#FFFFFF" stopOpacity="0.5" />
          <stop offset="1"    stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${gid}-spot`}>
          <stop offset="0"   stopColor="#E0F2FF" stopOpacity="0.55" />
          <stop offset="0.4" stopColor="#A8C7FF" stopOpacity="0.18" />
          <stop offset="1"   stopColor="#A8C7FF" stopOpacity="0" />
        </radialGradient>
        <filter id={`${gid}-blur1`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="28" />
        </filter>
        <filter id={`${gid}-blur2`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
        <filter id={`${gid}-blur3`} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <filter id={`${gid}-blurSpark`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>

      <style>{`
        @keyframes ${gid}-twinkle {
          0%, 100% { opacity: 0; transform: scale(0.6); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes ${gid}-shimmer {
          0%   { transform: translateY(0); opacity: 0; }
          15%  { opacity: 0.8; }
          85%  { opacity: 0.8; }
          100% { transform: translateY(-${c.vbH + 100}px); opacity: 0; }
        }
        @keyframes ${gid}-breath {
          0%, 100% { opacity: 0.78; }
          50%      { opacity: 1; }
        }
        @keyframes ${gid}-drift {
          0%, 100% { transform: translateX(0); }
          50%      { transform: translateX(6px); }
        }
      `}</style>

      {/* Sub-pillar (offset angle, lower opacity) */}
      <g style={{ animation: `${gid}-drift 11s ease-in-out infinite` }}>
        <path
          d={c.sub}
          stroke={`url(#${gid}-glow)`}
          strokeWidth="160"
          strokeLinecap="round"
          fill="none"
          opacity="0.32"
          filter={`url(#${gid}-blur1)`}
        />
        <path
          d={c.sub}
          stroke={`url(#${gid}-glow)`}
          strokeWidth="50"
          strokeLinecap="round"
          fill="none"
          opacity="0.55"
          filter={`url(#${gid}-blur2)`}
        />
      </g>

      {/* Main pillar — broadest halo */}
      <path
        d={c.main}
        stroke={`url(#${gid}-glow)`}
        strokeWidth="240"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
        filter={`url(#${gid}-blur1)`}
        style={{ animation: `${gid}-breath 7s ease-in-out infinite` }}
      />

      {/* Branching veins */}
      {c.veins.map((d, i) => (
        <path
          key={i}
          d={d}
          stroke={`url(#${gid}-glow)`}
          strokeWidth="28"
          strokeLinecap="round"
          fill="none"
          opacity="0.55"
          filter={`url(#${gid}-blur2)`}
          style={{ animation: `${gid}-breath ${6 + i * 0.7}s ease-in-out infinite ${i * 0.3}s` }}
        />
      ))}
      {c.veins.map((d, i) => (
        <path
          key={`v-${i}`}
          d={d}
          stroke={`url(#${gid}-glow)`}
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
          filter={`url(#${gid}-blur3)`}
        />
      ))}

      {/* Main pillar — mid + tight glow */}
      <path
        d={c.main}
        stroke={`url(#${gid}-glow)`}
        strokeWidth="90"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
        filter={`url(#${gid}-blur2)`}
      />
      <path
        d={c.main}
        stroke={`url(#${gid}-glow)`}
        strokeWidth="34"
        strokeLinecap="round"
        fill="none"
        opacity="0.95"
        filter={`url(#${gid}-blur3)`}
      />

      {/* Cool color highlight */}
      <circle
        cx={c.coolStop.cx}
        cy={c.coolStop.cy}
        r={c.coolStop.r}
        fill={`url(#${gid}-spot)`}
      />

      {/* Bright core */}
      <path
        d={c.main}
        stroke={`url(#${gid}-core)`}
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />

      {/* Sparkles */}
      {c.sparkles.map((s, i) => (
        <circle
          key={`s-${i}`}
          cx={s.cx}
          cy={s.cy}
          r={s.r}
          fill="#FFFFFF"
          filter={`url(#${gid}-blurSpark)`}
          style={{
            transformOrigin: `${s.cx}px ${s.cy}px`,
            animation: `${gid}-twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}

      {/* Travelling shimmer along the pillar */}
      <path
        d={c.main}
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        strokeDasharray="14 80"
        opacity="0.9"
        style={{
          animation: `${gid}-shimmer 6s linear infinite`,
        }}
      />
    </svg>
  );
}

window.LightPillar = LightPillar;
