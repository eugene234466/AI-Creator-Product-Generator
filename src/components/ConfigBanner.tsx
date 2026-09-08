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
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-start gap-3">
        <AlertTriangle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-300">AI not configured</p>
          <p className="text-xs text-amber-400/80 mt-0.5">
            Set <code className="bg-amber-500/20 px-1 rounded">OPENAI_API_KEY</code> in your{" "}
            <code className="bg-amber-500/20 px-1 rounded">.env</code> file to enable AI analysis.
            Also supports Groq, Mistral, Ollama via{" "}
            <code className="bg-amber-500/20 px-1 rounded">OPENAI_BASE_URL</code> and{" "}
            <code className="bg-amber-500/20 px-1 rounded">AI_MODEL</code>.
          </p>
        </div>
        <button
          onClick={() => setShow(false)}
          className="text-amber-400 hover:text-amber-300 text-xs"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
