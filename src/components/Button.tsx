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
  primary: "bg-amber hover:bg-amber/90 text-ink-950 border border-amber",
  secondary: "bg-ink-800 hover:bg-ink-700 text-parchment border border-rule",
  ghost: "bg-transparent hover:bg-ink-800 text-parchment-dim border border-rule",
  danger: "bg-brick-dim hover:bg-brick-dim/80 text-brick border border-brick/30",
  success: "bg-teal-dim hover:bg-teal-dim/80 text-teal border border-teal/30",
};

// min-height keeps every size at or above a 44px touch target on mobile,
// even though the visual padding stays compact on desktop.
const sizes = {
  sm: "text-xs px-3 py-1.5 gap-1.5 min-h-[36px]",
  md: "text-sm px-4 py-2 gap-2 min-h-[40px]",
  lg: "text-sm px-5 py-2.5 gap-2 min-h-[44px]",
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
        "inline-flex items-center justify-center rounded-[3px] font-medium transition-colors",
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
