import { cn } from "@/lib/utils";

type Props = {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  hint?: string;
  className?: string;
  multiline?: boolean;
  rows?: number;
};

export default function Input({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  required,
  hint,
  className,
  multiline,
  rows = 3,
}: Props) {
  const base =
    "w-full bg-ink-950 border border-rule rounded-[3px] px-3 py-2.5 text-base sm:text-sm text-parchment placeholder:text-parchment-faint focus:outline-none focus:ring-1 focus:ring-amber focus:border-amber transition-colors";

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className="text-sm font-medium text-parchment-dim">
          {label}
          {required && <span className="text-brick ml-1">*</span>}
        </label>
      )}
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={cn(base, "resize-y")}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={base}
        />
      )}
      {hint && <p className="text-xs text-parchment-faint">{hint}</p>}
    </div>
  );
}
