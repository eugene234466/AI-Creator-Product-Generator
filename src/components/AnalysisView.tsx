"use client";

import { useState } from "react";
import Card from "./Card";
import Badge from "./Badge";
import Button from "./Button";
import LoadingState from "./LoadingState";
import { sourceTypeBadge, sourceTypeLabel } from "@/lib/utils";
import { Brain, TrendingUp, DollarSign, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

type Analysis = {
  id: number;
  mainNiche: string;
  subNiches: string[];
  recurringTopics: string[];
  promisingTopics: string[];
  contentThemes: string[];
  audienceProblems: string[];
  audienceDesires: string[];
  repeatedQuestions: string[];
  buyingIntentSignals: string[];
  highPerformingContent: string[];
  gapsInSolutions: string[];
  contentPopularityNotes: string;
  monetizationPotentialNotes: string;
  sources: { label: string; type: "creator_post" | "audience_comment" | "ai_inference" | "external_research" }[];
};

type Props = {
  creator: { id: number; name: string; niche: string };
  analysis: Analysis | null;
  onAnalyze: () => Promise<void>;
  onContinue: () => void;
  loading: boolean;
};

function TagList({ items, variant = "slate" }: { items: string[]; variant?: "blue" | "purple" | "amber" | "slate" | "emerald" | "red" | "indigo" }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <Badge key={i} variant={variant}>{item}</Badge>
      ))}
      {items.length === 0 && <span className="text-xs text-slate-600 italic">None identified</span>}
    </div>
  );
}

function Section({ title, children, icon: Icon }: { title: string; children: React.ReactNode; icon?: React.ComponentType<{ size?: number; className?: string }> }) {
  const [open, setOpen] = useState(true);
  return (
    <Card className="space-y-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} className="text-indigo-400" />}
          <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
        </div>
        {open ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
      </button>
      {open && children}
    </Card>
  );
}

export default function AnalysisView({ creator, analysis, onAnalyze, onContinue, loading }: Props) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">Content Analysis</h2>
          <p className="text-sm text-slate-400 mt-0.5">{creator.name} · {creator.niche}</p>
        </div>
        {!analysis && !loading && (
          <Button onClick={onAnalyze} loading={loading}>
            <Brain size={14} />
            Run Analysis
          </Button>
        )}
        {analysis && (
          <Button variant="secondary" onClick={onAnalyze} loading={loading} size="sm">
            Re-analyze
          </Button>
        )}
      </div>

      {loading && (
        <LoadingState
          message="Analyzing creator content..."
          steps={[
            "Identifying niche and content themes",
            "Mapping audience problems and desires",
            "Detecting buying intent signals",
            "Finding content gaps",
            "Separating popularity from monetization potential",
          ]}
        />
      )}

      {!loading && !analysis && (
        <Card className="text-center py-12">
          <Brain size={32} className="text-indigo-400 mx-auto mb-3" />
          <p className="text-slate-300 font-medium">Ready to analyze</p>
          <p className="text-sm text-slate-500 mt-1">
            Click &quot;Run Analysis&quot; to identify audience problems, content themes, and monetization signals.
          </p>
        </Card>
      )}

      {analysis && !loading && (
        <div className="space-y-4">
          {/* Main niche */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <div className="text-2xl">🎯</div>
            <div>
              <p className="text-xs text-indigo-400 font-medium uppercase tracking-wide">Main Niche</p>
              <p className="text-slate-100 font-semibold">{analysis.mainNiche}</p>
            </div>
            <div className="ml-auto flex flex-wrap gap-1.5">
              {analysis.subNiches.map((s, i) => (
                <Badge key={i} variant="indigo">{s}</Badge>
              ))}
            </div>
          </div>

          {/* Critical separator */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-blue-500/20">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={14} className="text-blue-400" />
                <h3 className="text-sm font-semibold text-blue-300">Content Popularity</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{analysis.contentPopularityNotes}</p>
            </Card>
            <Card className="border-emerald-500/20">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign size={14} className="text-emerald-400" />
                <h3 className="text-sm font-semibold text-emerald-300">Monetization Potential</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{analysis.monetizationPotentialNotes}</p>
            </Card>
          </div>

          <Section title="Content Themes & Topics" icon={Brain}>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-1.5">Recurring Topics</p>
                <TagList items={analysis.recurringTopics} variant="slate" />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1.5">Content Themes</p>
                <TagList items={analysis.contentThemes} variant="indigo" />
              </div>
              <div>
                <p className="text-xs text-emerald-500 mb-1.5">🔥 Promising Topics (Monetization Lens)</p>
                <TagList items={analysis.promisingTopics} variant="emerald" />
              </div>
            </div>
          </Section>

          <Section title="Audience Intelligence" icon={Brain}>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-1.5">Audience Problems</p>
                <div className="space-y-1.5">
                  {analysis.audienceProblems.map((p, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="text-red-400 mt-0.5">•</span>
                      {p}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1.5">Audience Desires</p>
                <div className="space-y-1.5">
                  {analysis.audienceDesires.map((d, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      {d}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1.5">Repeated Questions</p>
                <TagList items={analysis.repeatedQuestions} variant="purple" />
              </div>
            </div>
          </Section>

          <Section title="Buying Intent Signals" icon={DollarSign}>
            <div className="space-y-1.5">
              {analysis.buyingIntentSignals.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="text-amber-400 mt-0.5">💰</span>
                  {s}
                </div>
              ))}
              {analysis.buyingIntentSignals.length === 0 && (
                <p className="text-xs text-slate-600 italic">No strong buying intent signals detected</p>
              )}
            </div>
          </Section>

          <Section title="Gaps in Existing Solutions" icon={AlertTriangle}>
            <div className="space-y-1.5">
              {analysis.gapsInSolutions.map((g, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="text-indigo-400 mt-0.5">→</span>
                  {g}
                </div>
              ))}
            </div>
          </Section>

          {/* Evidence sources */}
          <Card>
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Evidence Sources</h3>
            <p className="text-xs text-slate-500 mb-3">
              These labels indicate the evidence basis for each finding:
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {(["creator_post", "audience_comment", "ai_inference", "external_research"] as const).map((type) => (
                <span key={type} className={`text-xs px-2 py-1 rounded border ${sourceTypeBadge(type)}`}>
                  {sourceTypeLabel(type)}
                </span>
              ))}
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {analysis.sources?.map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded border flex-shrink-0 ${sourceTypeBadge(s.type)}`}>
                    {sourceTypeLabel(s.type)}
                  </span>
                  <span className="text-xs text-slate-400">{s.label}</span>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex justify-end">
            <Button onClick={onContinue}>
              Discover Opportunities →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
