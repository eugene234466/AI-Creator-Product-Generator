type Props = {
  message?: string;
  steps?: string[];
};

export default function LoadingState({ message = "Processing...", steps }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 gap-6 px-4">
      <div className="relative">
        <div className="w-14 h-14 rounded-full border-2 border-amber/20 border-t-amber animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-amber/20 animate-pulse" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-parchment font-medium">{message}</p>
        <p className="text-xs text-parchment-faint">This may take 15–60 seconds</p>
      </div>
      {steps && steps.length > 0 && (
        <div className="space-y-2 w-full max-w-sm">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-parchment-faint">
              <div className="w-1.5 h-1.5 rounded-full bg-amber/50 animate-pulse flex-shrink-0" />
              {step}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
