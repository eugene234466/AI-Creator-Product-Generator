"use client";

import { cn, scoreColor } from "@/lib/utils";

type Props = {
  score: number;
  size?: number;
  label?: string;
  className?: string;
};

// Same 70/40 thresholds as scoreColor/scoreBg in lib/utils, reading the
// actual design-token CSS variables so the ring always matches whatever
// a badge or bar elsewhere is showing for the same score.
function ringColorVar(score: number): string {
  if (score >= 70) return "var(--color-teal)";
  if (score >= 40) return "var(--color-amber)";
  return "var(--color-brick)";
}

export default function ScoreRing({ score, size = 80, label, className }: Props) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = ringColorVar(score);

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div style={{ width: size, height: size }} className="relative">
        <svg width={size} height={size} viewBox="0 0 90 90" className="-rotate-90">
          {/* Background ring */}
          <circle
            cx="45"
            cy="45"
            r={radius}
            fill="none"
            stroke="var(--color-ink-700)"
            strokeWidth="8"
          />
          {/* Score ring */}
          <circle
            cx="45"
            cy="45"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn("font-figures font-semibold", scoreColor(score))}
            style={{ fontSize: size * 0.22 }}
          >
            {Math.round(score)}
          </span>
        </div>
      </div>
      {label && (
        <span className="text-xs text-parchment-dim text-center leading-tight">{label}</span>
      )}
    </div>
  );
}
