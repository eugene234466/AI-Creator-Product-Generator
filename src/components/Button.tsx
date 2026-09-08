import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
};

const variants = {
  primary: "bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/50",
  secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700",
  ghost: "bg-transparent hover:bg-slate-800 text-slate-300 border border-slate-700",
  danger: "bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30",
  success: "bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30",
};

const sizes = {
  sm: "text-xs px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2 gap-2",
  lg: "text-sm px-5 py-2.5 gap-2",
};

export default function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled,
  loading,
  className,
  type = "button",
}: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {loading && (
        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
