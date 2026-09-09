"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Settings } from "lucide-react";

type Config = {
  hasApiKey: boolean;
  model: string;
  baseUrl: string;
  configured: boolean;
};

export default function ConfigBanner() {
  const [config, setConfig] = useState<Config | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => {
        setConfig(d);
        setShow(true);
      })
      .catch(() => {});
  }, []);

  if (!show || !config || config.configured) return null;

  return (
    <div className="bg-amber-dim border-b border-amber/20 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
        <div className="flex items-start gap-3 flex-1">
          <AlertTriangle size={14} className="text-amber mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber">AI not configured</p>
            <p className="text-xs text-amber/80 mt-0.5">
              Set <code className="bg-amber/20 px-1 rounded-[3px]">OPENAI_API_KEY</code> in your{" "}
              <code className="bg-amber/20 px-1 rounded-[3px]">.env</code> file to enable AI analysis.
              Also supports Groq, Mistral, Ollama via{" "}
              <code className="bg-amber/20 px-1 rounded-[3px]">OPENAI_BASE_URL</code> and{" "}
              <code className="bg-amber/20 px-1 rounded-[3px]">AI_MODEL</code>.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShow(false)}
          className="self-start text-amber hover:text-amber/80 text-xs pl-6 sm:pl-0"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
