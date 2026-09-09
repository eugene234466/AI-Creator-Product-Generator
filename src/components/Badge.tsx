import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  variant?: "blue" | "purple" | "amber" | "slate" | "emerald" | "red" | "indigo";
  className?: string;
};

// The design system defines three meaningful signal colors (teal = strong/
// positive, amber = flagged, brick = weak/negative) plus two neutral tiers
// for plain category labels that aren't valenced. The seven variant names
// below are kept as-is so every existing call site keeps working — they're
// just remapped onto that restrained palette instead of seven separate hues.
const variants = {
  emerald: "bg-teal-dim text-teal border border-teal/30",
  amber: "bg-amber-dim text-amber border border-amber/30",
  red: "bg-brick-dim text-brick border border-brick/30",
  slate: "bg-ink-800 text-parchment-dim border border-rule",
  blue: "bg-ink-800 text-parchment-dim border border-rule",
  indigo: "bg-ink-700 text-parchment border border-rule",
  purple: "bg-ink-700 text-parchment border border-rule",
};

export default function Badge({ children, variant = "slate", className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-[3px] text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
