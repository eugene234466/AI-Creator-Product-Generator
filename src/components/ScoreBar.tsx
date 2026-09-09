"use client";

import { cn, scoreColor } from "@/lib/utils";

type Props = {
  label: string;
  score: number;
  explanation?: string;
  className?: string;
};

// Maps to the same three signal colors as scoreColor/scoreBg in lib/utils,
// so a bar and a badge for the same score always agree.
function barColor(score: number): string {
  if (score >= 70) return "bg-teal";
  if (score >= 40) return "bg-amber";
  return "bg-brick";
}

export default function ScoreBar({ label, score, explanation, className }: Props) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-parchment-dim">{label}</span>
        <span className={cn("text-sm font-figures font-semibold", scoreColor(score))}>{score}</span>
      </div>
      <div className="h-1.5 bg-ink-800 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", barColor(score))}
          style={{ width: `${score}%` }}
        />
      </div>
      {explanation && (
        <p className="text-xs text-parchment-faint leading-snug">{explanation}</p>
      )}
    </div>
  );
}
