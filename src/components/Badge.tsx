import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  variant?: "blue" | "purple" | "amber" | "slate" | "emerald" | "red" | "indigo";
  className?: string;
};

const variants = {
  blue: "bg-blue-500/15 text-blue-300 border border-blue-500/25",
  purple: "bg-purple-500/15 text-purple-300 border border-purple-500/25",
  amber: "bg-amber-500/15 text-amber-300 border border-amber-500/25",
  slate: "bg-slate-500/15 text-slate-300 border border-slate-500/25",
  emerald: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25",
  red: "bg-red-500/15 text-red-300 border border-red-500/25",
  indigo: "bg-indigo-500/15 text-indigo-300 border border-indigo-500/25",
};

export default function Badge({ children, variant = "slate", className }: Props) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  );
}
