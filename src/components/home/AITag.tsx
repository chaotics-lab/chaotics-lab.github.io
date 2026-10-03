import { AI_RAMP as RAMP, aiLevel } from '@/config/aiLevels';

// AI usage as five slanted bars: none lit = made by hand, all five = vibe coded.
export const AITag = ({ value, className = '' }: { value: number; className?: string }) => {
  const level = aiLevel(value);
  const lit = level.value / 20;
  return (
    <span
      className={`ai-tag ${className}`}
      style={lit ? { ['--ai' as string]: RAMP[lit - 1] } : undefined}
      title={`AI usage: ${level.label}`}
      aria-label={`AI usage: ${level.label}`}
    >
      <b>AI</b>
      <span className="ai-tag-bars" aria-hidden="true">
        {RAMP.map((color, i) => <i key={i} style={i < lit ? { background: color } : undefined} />)}
      </span>
      <span aria-hidden="true">{level.short}</span>
    </span>
  );
};
