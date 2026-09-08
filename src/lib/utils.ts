import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function scoreColor(score: number): string {
  if (score >= 75) return "text-emerald-400";
  if (score >= 55) return "text-yellow-400";
  if (score >= 35) return "text-orange-400";
  return "text-red-400";
}

export function scoreBg(score: number): string {
  if (score >= 75) return "bg-emerald-500/20 border-emerald-500/30";
  if (score >= 55) return "bg-yellow-500/20 border-yellow-500/30";
  if (score >= 35) return "bg-orange-500/20 border-orange-500/30";
  return "bg-red-500/20 border-red-500/30";
}

export function scoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 65) return "Strong";
  if (score >= 50) return "Moderate";
  if (score >= 35) return "Weak";
  return "Poor";
}

export function formatPrice(low: number, high: number): string {
  return `$${low}–$${high}`;
}

export function difficultyColor(difficulty: string): string {
  switch (difficulty?.toLowerCase()) {
    case "easy":
      return "text-emerald-400 bg-emerald-500/10";
    case "medium":
      return "text-yellow-400 bg-yellow-500/10";
    case "hard":
      return "text-red-400 bg-red-500/10";
    default:
      return "text-slate-400 bg-slate-500/10";
  }
}

export function sourceTypeLabel(
  type: "creator_post" | "audience_comment" | "ai_inference" | "external_research"
): string {
  const labels = {
    creator_post: "Creator Post",
    audience_comment: "Audience Comment",
    ai_inference: "AI Inference",
    external_research: "External Research",
  };
  return labels[type] ?? type;
}

export function sourceTypeBadge(
  type: "creator_post" | "audience_comment" | "ai_inference" | "external_research"
): string {
  const colors = {
    creator_post: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    audience_comment: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    ai_inference: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    external_research: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  };
  return colors[type] ?? "bg-slate-500/20 text-slate-300";
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}
