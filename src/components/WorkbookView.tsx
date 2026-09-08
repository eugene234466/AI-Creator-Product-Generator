"use client";

import { useState } from "react";
import Card from "./Card";
import Badge from "./Badge";
import Button from "./Button";
import LoadingState from "./LoadingState";
import { BookOpen, CheckSquare, PenLine, BarChart2, Layout, ChevronDown, ChevronUp, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

type WorkbookSection = {
  id: string;
  title: string;
  type: "section" | "exercise" | "worksheet" | "checklist" | "tracker";
  content: string;
  items?: string[];
  prompts?: string[];
};

type Workbook = {
  id: number;
  title: string;
  subtitle: string;
  introduction: string;
  whoItsFor: string;
  desiredOutcome: string;
  instructions: string;
  sections: WorkbookSection[];
  actionPlan: string;
  finalReview: string;
  nextSteps: string;
  isBranded: number;
  brandingApplied: null | { tone: string; positioning: string };
};

type Props = {
  workbook: Workbook | null;
  loading: boolean;
  onBrand: () => Promise<void>;
  branding: boolean;
};

const sectionIcons = {
  section: Layout,
  exercise: PenLine,
  worksheet: PenLine,
  checklist: CheckSquare,
  tracker: BarChart2,
};

const sectionColors = {
  section: "border-blue-500/20 bg-blue-500/5",
  exercise: "border-purple-500/20 bg-purple-500/5",
  worksheet: "border-indigo-500/20 bg-indigo-500/5",
  checklist: "border-emerald-500/20 bg-emerald-500/5",
  tracker: "border-amber-500/20 bg-amber-500/5",
};

const sectionBadge = {
  section: "blue" as const,
  exercise: "purple" as const,
  worksheet: "indigo" as const,
  checklist: "emerald" as const,
  tracker: "amber" as const,
};

function WorkbookSectionCard({ section }: { section: WorkbookSection }) {
  const [open, setOpen] = useState(true);
  const Icon = sectionIcons[section.type] ?? Layout;

  return (
    <div className={cn("rounded-xl border p-4 space-y-3", sectionColors[section.type])}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-slate-400" />
          <h4 className="font-medium text-slate-200 text-sm">{section.title}</h4>
          <Badge variant={sectionBadge[section.type]} className="text-xs">{section.type}</Badge>
        </div>
        {open ? <ChevronUp size={13} className="text-slate-500" /> : <ChevronDown size={13} className="text-slate-500" />}
      </button>

      {open && (
        <div className="space-y-3 pl-5">
          {section.content && (
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{section.content}</p>
          )}

          {section.prompts && section.prompts.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-400">Reflection Prompts</p>
              {section.prompts.map((prompt, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-indigo-400 text-sm font-bold flex-shrink-0">{i + 1}.</span>
                  <div className="flex-1">
                    <p className="text-xs text-slate-300 mb-1">{prompt}</p>
                    <div className="h-8 border-b border-dashed border-slate-700 w-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {section.items && section.items.length > 0 && (
            <div className="space-y-1.5">
              {section.type === "checklist" ? (
                section.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-4 h-4 border border-slate-600 rounded flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-300">{item}</span>
                  </div>
                ))
              ) : (
                section.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-500 flex-shrink-0 mt-1.5" />
                    <span className="text-xs text-slate-300">{item}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function WorkbookView({ workbook, loading, onBrand, branding }: Props) {
  const [showFullWorkbook, setShowFullWorkbook] = useState(false);

  if (loading) {
    return (
      <LoadingState
        message="Generating workbook..."
        steps={[
          "Defining workbook structure",
          "Writing introduction and framing",
          "Building exercises and worksheets",
          "Creating checklists and trackers",
          "Writing action plan and next steps",
        ]}
      />
    );
  }

  if (!workbook) {
    return (
      <Card className="text-center py-12">
        <BookOpen size={32} className="text-slate-500 mx-auto mb-3" />
        <p className="text-slate-400">Workbook not yet generated.</p>
        <p className="text-xs text-slate-600 mt-1">Generate a product recommendation first, then click &quot;Generate Workbook&quot;.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">Workbook</h2>
          {workbook.isBranded === 1 && (
            <div className="flex items-center gap-1.5 mt-1">
              <Palette size={12} className="text-purple-400" />
              <span className="text-xs text-purple-400">Creator-branded version</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowFullWorkbook(!showFullWorkbook)}
          >
            {showFullWorkbook ? "Collapse" : "Expand All"}
          </Button>
          {!branding && (
            <Button onClick={onBrand} loading={branding} variant="secondary" size="sm">
              <Palette size={13} />
              Brand for Creator
            </Button>
          )}
        </div>
      </div>

      {/* Cover */}
      <div className="rounded-xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 p-8 text-center space-y-2">
        <p className="text-xs text-indigo-400 font-medium uppercase tracking-widest">Workbook</p>
        <h1 className="text-2xl font-bold text-slate-100">{workbook.title}</h1>
        {workbook.subtitle && (
          <p className="text-slate-300 text-sm">{workbook.subtitle}</p>
        )}
        <div className="flex items-center justify-center gap-2 mt-3">
          <Badge variant="indigo">{workbook.sections?.length ?? 0} sections</Badge>
          {workbook.isBranded === 1 && <Badge variant="purple">Branded</Badge>}
        </div>
      </div>

      {/* Front matter */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <p className="text-xs text-slate-500 font-medium mb-2">Who It&apos;s For</p>
          <p className="text-xs text-slate-300 leading-relaxed">{workbook.whoItsFor}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500 font-medium mb-2">Desired Outcome</p>
          <p className="text-xs text-slate-300 leading-relaxed">{workbook.desiredOutcome}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500 font-medium mb-2">How to Use This</p>
          <p className="text-xs text-slate-300 leading-relaxed">{workbook.instructions}</p>
        </Card>
      </div>

      {/* Introduction */}
      <Card>
        <h3 className="text-sm font-semibold text-slate-200 mb-2">Introduction</h3>
        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{workbook.introduction}</p>
      </Card>

      {/* Sections */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-400">Workbook Sections ({workbook.sections?.length ?? 0})</h3>
        {workbook.sections?.map((section) => (
          <WorkbookSectionCard key={section.id} section={section} />
        ))}
      </div>

      {/* Action plan */}
      {workbook.actionPlan && (
        <Card className="border-emerald-500/20">
          <h3 className="text-sm font-semibold text-emerald-300 mb-2">Action Plan</h3>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{workbook.actionPlan}</p>
        </Card>
      )}

      {/* Final review */}
      {workbook.finalReview && (
        <Card>
          <h3 className="text-sm font-semibold text-slate-200 mb-2">Final Review</h3>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{workbook.finalReview}</p>
        </Card>
      )}

      {/* Next steps */}
      {workbook.nextSteps && (
        <Card className="border-amber-500/20">
          <h3 className="text-sm font-semibold text-amber-300 mb-2">Next Steps</h3>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{workbook.nextSteps}</p>
        </Card>
      )}

      {/* Brand CTA */}
      {workbook.isBranded === 0 && (
        <div className="flex justify-center p-6 rounded-xl border border-dashed border-slate-700">
          <div className="text-center space-y-3">
            <Palette size={24} className="text-purple-400 mx-auto" />
            <p className="text-sm font-medium text-slate-300">Brand this workbook for the creator</p>
            <p className="text-xs text-slate-500">Adapts tone, vocabulary, and positioning to fit the creator&apos;s style.</p>
            <Button onClick={onBrand} loading={branding}>
              <Palette size={14} />
              Apply Creator Branding
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
