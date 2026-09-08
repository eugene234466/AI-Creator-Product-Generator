import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  onClick?: () => void;
};

export default function Card({ children, className, glow, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl border border-slate-800 bg-[#111318] p-5",
        glow && "ring-1 ring-indigo-500/30 shadow-lg shadow-indigo-500/5",
        onClick && "cursor-pointer hover:border-slate-700 transition-colors",
        className
      )}
    >
      {children}
    </div>
  );
}
