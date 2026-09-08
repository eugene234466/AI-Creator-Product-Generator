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
    "w-full bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors";

  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <label className="text-sm font-medium text-slate-300">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
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
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
