"use client";

import { cn } from "@/lib/utils";

type Props = {
  label: string;
  score: number;
  explanation?: string;
  className?: string;
};

export default function ScoreBar({ label, score, explanation, className }: Props) {
  const color =
    score >= 75
      ? "bg-emerald-500"
      : score >= 55
      ? "bg-yellow-500"
      : score >= 35
      ? "bg-orange-500"
      : "bg-red-500";

  const textColor =
    score >= 75
      ? "text-emerald-400"
      : score >= 55
      ? "text-yellow-400"
      : score >= 35
      ? "text-orange-400"
      : "text-red-400";

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-300">{label}</span>
        <span className={cn("text-sm font-semibold tabular-nums", textColor)}>{score}</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", color)}
          style={{ width: `${score}%` }}
        />
      </div>
      {explanation && (
        <p className="text-xs text-slate-500 leading-snug">{explanation}</p>
      )}
    </div>
  );
}
