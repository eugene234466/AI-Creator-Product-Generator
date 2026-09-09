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
        "rounded-[3px] border border-rule bg-ink-900 p-4 sm:p-5",
        glow && "ring-1 ring-amber/40",
        onClick && "cursor-pointer hover:border-parchment-faint transition-colors",
        className
      )}
    >
      {children}
    </div>
  );
}
