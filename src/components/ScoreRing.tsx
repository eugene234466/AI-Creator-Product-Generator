"use client";

import { cn, scoreColor } from "@/lib/utils";

type Props = {
  score: number;
  size?: number;
  label?: string;
  className?: string;
};

export default function ScoreRing({ score, size = 80, label, className }: Props) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? "#10b981" : score >= 55 ? "#eab308" : score >= 35 ? "#f97316" : "#ef4444";

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div style={{ width: size, height: size }} className="relative">
        <svg
          width={size}
          height={size}
          viewBox="0 0 90 90"
          className="-rotate-90"
        >
          {/* Background ring */}
          <circle
            cx="45"
            cy="45"
            r={radius}
            fill="none"
            stroke="#1e2235"
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
          <span className={cn("font-bold", scoreColor(score))} style={{ fontSize: size * 0.22 }}>
            {Math.round(score)}
          </span>
        </div>
      </div>
      {label && (
        <span className="text-xs text-slate-400 text-center leading-tight">{label}</span>
      )}
    </div>
  );
}
