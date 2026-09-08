type Props = {
  message?: string;
  steps?: string[];
};

export default function LoadingState({ message = "Processing...", steps }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6">
      <div className="relative">
        <div className="w-14 h-14 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-indigo-500/20 animate-pulse" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-slate-200 font-medium">{message}</p>
        <p className="text-xs text-slate-500">This may take 15–60 seconds</p>
      </div>
      {steps && steps.length > 0 && (
        <div className="space-y-2 w-full max-w-sm">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50 animate-pulse" />
              {step}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
