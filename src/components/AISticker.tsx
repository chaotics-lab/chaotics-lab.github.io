import { fonts, toCssFontFamily } from '../config/fonts';

interface AIStickerProps {
  value: number; // 0-100
  size?: number; // diameter in pixels
}

const LEVELS = [
  { threshold: 0,   short: 'FREE',   color: '#2ECC71' },
  { threshold: 20,  short: 'DOCS',   color: '#A3E635' },
  { threshold: 40,  short: 'AUTO',   color: '#FDE047' },
  { threshold: 60,  short: 'COLLAB', color: '#FB923C' },
  { threshold: 80,  short: 'PILOT',  color: '#F97316' },
  { threshold: 100, short: 'VIBE',   color: '#EF4444' },
];

function getLevel(val: number) {
  const match = LEVELS.find(l => l.threshold === val);
  if (match) return match;
  return LEVELS.reduce((prev, curr) =>
    Math.abs(curr.threshold - val) < Math.abs(prev.threshold - val) ? curr : prev
  );
}

function hexToRgb(hex: string): [number, number, number] {
  const c = parseInt(hex.slice(1), 16);
  return [(c >> 16) & 0xff, (c >> 8) & 0xff, c & 0xff];
}

// Smoothly interpolates color across the full 0-100 range
function interpolateColor(val: number): string {
  const v = Math.max(0, Math.min(100, val));
  const lo = [...LEVELS].reverse().find(l => l.threshold <= v) ?? LEVELS[0];
  const hi = LEVELS.find(l => l.threshold >= v) ?? LEVELS[LEVELS.length - 1];
  if (lo.threshold === hi.threshold) return lo.color;
  const t = (v - lo.threshold) / (hi.threshold - lo.threshold);
  const [r1, g1, b1] = hexToRgb(lo.color);
  const [r2, g2, b2] = hexToRgb(hi.color);
  return `rgb(${Math.round(r1+(r2-r1)*t)},${Math.round(g1+(g2-g1)*t)},${Math.round(b1+(b2-b1)*t)})`;
}

function darken(color: string, amount: number): string {
  const nums = color.startsWith('#')
    ? hexToRgb(color)
    : (color.match(/\d+/g)!.map(Number) as [number, number, number]);
  return `rgb(${Math.max(0,nums[0]-amount)},${Math.max(0,nums[1]-amount)},${Math.max(0,nums[2]-amount)})`;
}

function polarToXY(deg: number, r: number, cx: number, cy: number): [number, number] {
  const rad = (deg - 90) * (Math.PI / 180);
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function arcPath(startDeg: number, sweep: number, r: number, cx: number, cy: number): string {
  if (sweep <= 0) return '';
  const s = Math.min(sweep, 359.9);
  const [sx, sy] = polarToXY(startDeg, r, cx, cy);
  const [ex, ey] = polarToXY(startDeg + s, r, cx, cy);
  return `M${sx.toFixed(2)},${sy.toFixed(2)} A${r},${r},0,${s > 180 ? 1 : 0},1,${ex.toFixed(2)},${ey.toFixed(2)}`;
}

export function AISticker({ value, size = 80 }: AIStickerProps) {
  const clampedValue = Math.max(0, Math.min(100, value));
  const level = getLevel(clampedValue);
  const arcColor = interpolateColor(clampedValue);

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.48;
  const arcR = size * 0.38;
  const innerR = arcR * 0.68;
  const trackSw = size * 0.028;
  const fillSw = size * 0.022;

  const START_DEG = 140;
  const SWEEP = 260;

  const filledSweep = (clampedValue / 100) * SWEEP;
  const track = arcPath(START_DEG, SWEEP, arcR, cx, cy);
  const fill = clampedValue > 0 ? arcPath(START_DEG, filledSweep, arcR, cx, cy) : '';
  const [dotX, dotY] = polarToXY(START_DEG + filledSweep, arcR, cx, cy);

  const ticks = [0, 1, 2, 3, 4, 5].map(i => {
    const deg = START_DEG + (i / 5) * SWEEP;
    const [x1, y1] = polarToXY(deg, arcR - trackSw * 2.2, cx, cy);
    const [x2, y2] = polarToXY(deg, arcR + trackSw * 0.5, cx, cy);
    return { x1, y1, x2, y2 };
  });

  const aiFs = size * 0.18;
  const tierFs = size * 0.076;
  const uid = `sticker-${clampedValue}`;

  return (
    <>
      <style>{`
        @keyframes rotateGlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 0.3; }
          50%       { opacity: 0.55; }
        }
        .ai-sticker-wrap {
          position: relative;
          border-radius: 50%;
          display: inline-block;
        }
        .ai-sticker-wrap::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: conic-gradient(
            from 0deg,
            transparent 0deg,
            rgba(255,255,255,0.15) 60deg,
            rgba(255,255,255,0.35) 90deg,
            rgba(255,255,255,0.15) 120deg,
            transparent 180deg,
            transparent 360deg
          );
          mix-blend-mode: overlay;
          animation: rotateGlow 80s linear infinite, shimmer 4s ease-in-out infinite;
          pointer-events: none;
        }
        .ai-sticker-wrap::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: radial-gradient(
            ellipse at 28% 28%,
            rgba(255,255,255,0.22) 0%,
            rgba(255,255,255,0.08) 40%,
            transparent 65%
          );
          mix-blend-mode: overlay;
          pointer-events: none;
        }
      `}</style>

      <div className="ai-sticker-wrap" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id={`${uid}-bg`} cx="45%" cy="38%" r="60%">
              <stop offset="0%" stopColor="#2a2a2a" />
              <stop offset="100%" stopColor="#111111" />
            </radialGradient>
            <radialGradient id={`${uid}-inner`} cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#1c1c1c" />
              <stop offset="100%" stopColor="#080808" />
            </radialGradient>
          </defs>

          {/* Outer circle */}
          <circle cx={cx} cy={cy} r={outerR} fill={`url(#${uid}-bg)`} />
          <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={size * 0.012} />

          {/* Inner circle */}
          <circle cx={cx} cy={cy} r={innerR} fill={`url(#${uid}-inner)`} />
          <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={size * 0.007} />

          {/* Track */}
          <path d={track} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={trackSw} strokeLinecap="round" />

          {/* Filled arc — color interpolated from gauge position */}
          {fill && (
            <path
              d={fill}
              fill="none"
              stroke={darken(arcColor, 90)}
              strokeWidth={fillSw}
              strokeLinecap="round"
            />
          )}

          {/* Tick marks */}
          {ticks.map((t, i) => (
            <line
              key={i}
              x1={t.x1.toFixed(1)} y1={t.y1.toFixed(1)}
              x2={t.x2.toFixed(1)} y2={t.y2.toFixed(1)}
              stroke="rgba(255,255,255,0.18)"
              strokeWidth={size * 0.009}
              strokeLinecap="round"
            />
          ))}

          {/* Center: AI */}
          <text
            x={cx}
            y={cy + size * 0.03}
            textAnchor="middle"
            fontSize={aiFs}
            fontWeight={700}
            fontFamily={toCssFontFamily(fonts.sticker)}
            fill="white"
            letterSpacing="-0.02em"
          >
            AI
          </text>

          {/* Center: tier short name, colored by level */}
          <text
            x={cx}
            y={cy + size * 0.155}
            textAnchor="middle"
            fontSize={tierFs}
            fontWeight={600}
            fontFamily={toCssFontFamily(fonts.sticker)}
            fill={level.color}
            letterSpacing="0.1em"
            opacity={0.85}
          >
            {level.short}
          </text>
        </svg>
      </div>
    </>
  );
}