"use client";

import { useState, useEffect } from "react";
import ConfigBanner from "@/components/ConfigBanner";
import CreatorForm from "@/components/CreatorForm";
import AnalysisView from "@/components/AnalysisView";
import OpportunitiesView from "@/components/OpportunitiesView";
import RecommendationView from "@/components/RecommendationView";
import WorkbookView from "@/components/WorkbookView";
import BrandingView from "@/components/BrandingView";
import OutreachView from "@/components/OutreachView";
import ReportView from "@/components/ReportView";
import Button from "@/components/Button";
import {
  User, Brain, Lightbulb, Package, BookOpen, Palette, MessageSquare, FileDown,
  ChevronRight, Plus, ArrowLeft
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Creator = {
  id: number;
  name: string;
  niche: string;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  youtubeUrl?: string | null;
  description?: string | null;
  manualPosts?: string | null;
  audienceInfo?: string | null;
};

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

type Opportunity = {
  id: number;
  productIdea: string;
  targetAudience: string;
  problemSolved: string;
  desiredOutcome: string;
  evidenceSignals: string[];
  creatorCredibility: string;
  existingAlternatives: string;
  differentiation: string;
  suggestedFormat: string;
  priceRangeLow: number;
  priceRangeHigh: number;
  difficulty: string;
  scoreAudienceFit: number;
  scoreProblemSeverity: number;
  scoreEvidenceOfDemand: number;
  scoreBuyingIntent: number;
  scoreContentPerformance: number;
  scoreCreatorAuthority: number;
  scoreCompetition: number;
  scoreDifferentiation: number;
  scoreEaseOfCreation: number;
  scoreMonetizationPotential: number;
  overallScore: number;
  scoreExplanations: Record<string, string>;
  creatorProductScore: number;
  creatorProductScoreBreakdown: Record<string, string | number>;
  isSelected: number;
};

type Recommendation = {
  id: number;
  productName: string;
  productType: string;
  targetCustomer: string;
  coreProblem: string;
  transformation: string;
  uniqueAngle: string;
  recommendedPrice: number;
  recommendedContents: string[];
  whyThisCreator: string;
};

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

type BrandingBrief = {
  tone: string;
  vocabularyTendencies: string[];
  contentStyle: string;
  audienceSophistication: string;
  visualDirection: string;
  positioning: string;
  productNamingStyle: string;
  productNamingExample?: string;
  ctaStyle: string;
  audienceExamples: string[];
  disclaimer: string;
};

type OutreachDraft = {
  id: number;
  subject: string | null;
  message: string;
  platform: string;
  tone: string;
};

// ─── Workflow Steps ──────────────────────────────────────────────────────────

type Step = "creator" | "analyze" | "opportunities" | "recommend" | "workbook" | "brand" | "outreach" | "report";

const STEPS: { key: Step; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { key: "creator", label: "Creator", icon: User },
  { key: "analyze", label: "Analyze", icon: Brain },
  { key: "opportunities", label: "Opportunities", icon: Lightbulb },
  { key: "recommend", label: "Recommend", icon: Package },
  { key: "workbook", label: "Workbook", icon: BookOpen },
  { key: "brand", label: "Brand", icon: Palette },
  { key: "outreach", label: "Outreach", icon: MessageSquare },
  { key: "report", label: "Report", icon: FileDown },
];

// ─── Creator List ─────────────────────────────────────────────────────────────

function CreatorList({
  creators,
  onSelect,
  onNew,
}: {
  creators: Creator[];
  onSelect: (c: Creator) => void;
  onNew: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-display font-medium text-parchment">Creators</h2>
        <Button onClick={onNew} size="sm">
          <Plus size={13} />
          New Creator
        </Button>
      </div>
      {creators.length === 0 ? (
        <div className="text-center py-14 sm:py-16 px-4 rounded-[3px] border border-dashed border-rule">
          <User size={32} className="text-parchment-faint mx-auto mb-3" />
          <p className="text-parchment-dim font-medium">No creators yet</p>
          <p className="text-sm text-parchment-faint mt-1 mb-4">Add your first creator to start analyzing opportunities.</p>
          <Button onClick={onNew}>
            <Plus size={13} />
            Add Creator
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {creators.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelect(c)}
              className="flex items-center gap-3 p-4 min-h-[64px] rounded-[3px] border border-rule bg-ink-900 hover:border-parchment-faint cursor-pointer transition-colors group"
            >
              <div className="w-9 h-9 rounded-full bg-amber-dim flex items-center justify-center text-amber font-semibold text-sm flex-shrink-0">
                {c.name[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-parchment truncate">{c.name}</p>
                <p className="text-xs text-parchment-faint truncate">{c.niche}</p>
              </div>
              <ChevronRight size={14} className="text-parchment-faint group-hover:text-parchment-dim transition-colors flex-shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Step Progress Bar ────────────────────────────────────────────────────────

function StepProgress({
  steps,
  currentStep,
  reachedStep,
  onStepClick,
}: {
  steps: typeof STEPS;
  currentStep: Step;
  reachedStep: number;
  onStepClick: (step: Step, idx: number) => void;
}) {
  const currentIdx = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory sm:snap-none">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isActive = step.key === currentStep;
        const isDone = idx < currentIdx;
        const isReachable = idx <= reachedStep;

        return (
          <div key={step.key} className="flex items-center flex-shrink-0 snap-start">
            <button
              onClick={() => isReachable && onStepClick(step.key, idx)}
              disabled={!isReachable}
              className={`flex flex-col items-center gap-1 px-3 py-2 min-w-[56px] rounded-[3px] transition-colors ${
                isActive
                  ? "text-amber"
                  : isDone
                  ? "text-teal hover:text-teal/80"
                  : isReachable
                  ? "text-parchment-dim hover:text-parchment"
                  : "text-parchment-faint/50 cursor-not-allowed"
              }`}
            >
              <div className={`w-8 h-8 sm:w-7 sm:h-7 rounded-full flex items-center justify-center border transition-colors ${
                isActive
                  ? "bg-amber-dim border-amber/60"
                  : isDone
                  ? "bg-teal-dim border-teal/40"
                  : isReachable
                  ? "bg-ink-800 border-rule"
                  : "bg-ink-900 border-rule-soft"
              }`}>
                <Icon size={12} />
              </div>
              <span className="text-[11px] sm:text-xs font-medium whitespace-nowrap">{step.label}</span>
            </button>
            {idx < steps.length - 1 && (
              <div className={`w-4 sm:w-6 h-px flex-shrink-0 ${isDone ? "bg-teal/30" : "bg-rule"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function Home() {
  const [view, setView] = useState<"list" | "workflow" | "new">("list");
  const [creators, setCreators] = useState<Creator[]>([]);
  const [activeCreator, setActiveCreator] = useState<Creator | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>("creator");
  const [reachedStep, setReachedStep] = useState(0);

  // Workflow state
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [opportunitiesLoading, setOpportunitiesLoading] = useState(false);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<number | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [whyThisOne, setWhyThisOne] = useState<string>("");
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [workbook, setWorkbook] = useState<Workbook | null>(null);
  const [workbookLoading, setWorkbookLoading] = useState(false);
  const [brandingBrief, setBrandingBrief] = useState<BrandingBrief | null>(null);
  const [brandingLoading, setBrandingLoading] = useState(false);
  const [outreachDrafts, setOutreachDrafts] = useState<OutreachDraft[]>([]);
  const [outreachLoading, setOutreachLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Load creators on mount
  useEffect(() => {
    fetch("/api/creators")
      .then((r) => r.json())
      .then((d) => setCreators(d.creators ?? []))
      .catch(() => {});
  }, []);

  const goToStep = (step: Step, idx: number) => {
    setCurrentStep(step);
    setError("");
  };

  const advanceTo = (step: Step) => {
    const idx = STEPS.findIndex((s) => s.key === step);
    setCurrentStep(step);
    setReachedStep(Math.max(reachedStep, idx));
    setError("");
  };

  const selectCreator = (creator: Creator) => {
    setActiveCreator(creator);
    setAnalysis(null);
    setOpportunities([]);
    setSelectedOpportunityId(null);
    setRecommendation(null);
    setWorkbook(null);
    setBrandingBrief(null);
    setOutreachDrafts([]);
    setReachedStep(1);
    setCurrentStep("analyze");
    setView("workflow");
  };

  const handleCreatorCreated = (creator: { id: number; name: string; niche: string }) => {
    const full = creator as Creator;
    setCreators((prev) => [full, ...prev]);
    setActiveCreator(full);
    setReachedStep(1);
    setCurrentStep("analyze");
    setView("workflow");
  };

  // ─── Analyze ──────────────────────────────────────────────────────────────

  const handleAnalyze = async () => {
    if (!activeCreator) return;
    setAnalyzeLoading(true);
    setError("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorId: activeCreator.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAnalysis(data.analysis);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setAnalyzeLoading(false);
    }
  };

  // ─── Discover Opportunities ───────────────────────────────────────────────

  const handleDiscoverOpportunities = async () => {
    if (!activeCreator || !analysis) return;
    setOpportunitiesLoading(true);
    setError("");
    try {
      const res = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisId: analysis.id,
          creatorId: activeCreator.id,
          creatorName: activeCreator.name,
          creatorNiche: activeCreator.niche,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOpportunities(data.opportunities ?? []);
      setSelectedOpportunityId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to discover opportunities");
    } finally {
      setOpportunitiesLoading(false);
    }
  };

  // ─── Select Opportunity & Generate Recommendation ─────────────────────────

  const handleSelectOpportunity = async (opportunityId: number) => {
    setSelectedOpportunityId(opportunityId);
    setRecommendLoading(true);
    setError("");
    advanceTo("recommend");
    setCurrentStep("recommend");
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRecommendation(data.recommendation);
      setWhyThisOne(data.whyThisOne ?? "");
      setOpportunities((prev) =>
        prev.map((o) => ({ ...o, isSelected: o.id === opportunityId ? 1 : 0 }))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate recommendation");
    } finally {
      setRecommendLoading(false);
    }
  };

  // ─── Generate Workbook ────────────────────────────────────────────────────

  const handleGenerateWorkbook = async () => {
    if (!recommendation) return;
    setWorkbookLoading(true);
    setError("");
    advanceTo("workbook");
    setCurrentStep("workbook");
    try {
      const res = await fetch("/api/workbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recommendationId: recommendation.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setWorkbook(data.workbook);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate workbook");
    } finally {
      setWorkbookLoading(false);
    }
  };

  // ─── Apply Branding ───────────────────────────────────────────────────────

  const handleBrand = async () => {
    if (!workbook) return;
    setBrandingLoading(true);
    setError("");
    advanceTo("brand");
    setCurrentStep("brand");
    try {
      const res = await fetch("/api/brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workbookId: workbook.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setWorkbook(data.workbook);
      setBrandingBrief(data.brandingBrief);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to apply branding");
    } finally {
      setBrandingLoading(false);
    }
  };

  // ─── Generate Outreach ────────────────────────────────────────────────────

  const handleGenerateOutreach = async () => {
    if (!selectedOpportunityId) return;
    setOutreachLoading(true);
    setError("");
    advanceTo("outreach");
    try {
      const res = await fetch("/api/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId: selectedOpportunityId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOutreachDrafts(data.drafts ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate outreach");
    } finally {
      setOutreachLoading(false);
    }
  };

  const selectedOpportunity = opportunities.find((o) => o.id === selectedOpportunityId) ?? null;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-ink-950">
      <ConfigBanner />

      {/* Header */}
      <header className="border-b border-rule-soft px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-[3px] bg-amber-dim flex items-center justify-center flex-shrink-0">
              <span className="text-amber text-sm">⚡</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-parchment truncate">Creator Product Intelligence</h1>
              <p className="text-xs text-parchment-faint hidden sm:block">Find opportunities · Build workbooks · Partner with creators</p>
            </div>
          </div>
          {view !== "list" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setView("list");
                setActiveCreator(null);
                setCurrentStep("creator");
                setReachedStep(0);
              }}
              className="flex-shrink-0"
            >
              <ArrowLeft size={13} />
              <span className="hidden sm:inline">All Creators</span>
            </Button>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Creator List View */}
        {view === "list" && (
          <CreatorList
            creators={creators}
            onSelect={selectCreator}
            onNew={() => {
              setView("new");
              setCurrentStep("creator");
              setReachedStep(0);
            }}
          />
        )}

        {/* New Creator Form */}
        {view === "new" && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Button variant="ghost" size="sm" onClick={() => setView("list")}>
                <ArrowLeft size={13} />
                Back
              </Button>
            </div>
            <CreatorForm onCreated={handleCreatorCreated} />
          </div>
        )}

        {/* Workflow View */}
        {view === "workflow" && activeCreator && (
          <div className="space-y-6">
            {/* Creator header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-dim flex items-center justify-center text-amber font-bold flex-shrink-0">
                {activeCreator.name[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-parchment truncate">{activeCreator.name}</h2>
                <p className="text-xs text-parchment-faint truncate">{activeCreator.niche}</p>
              </div>
            </div>

            {/* Step progress */}
            <div className="bg-ink-900 rounded-[3px] border border-rule p-3 sm:p-4">
              <StepProgress
                steps={STEPS}
                currentStep={currentStep}
                reachedStep={reachedStep}
                onStepClick={goToStep}
              />
            </div>

            {/* Error banner */}
            {error && (
              <div className="p-3 rounded-[3px] bg-brick-dim border border-brick/20">
                <p className="text-sm text-brick">⚠ {error}</p>
              </div>
            )}

            {/* Step content */}
            <div className="min-h-96">
              {currentStep === "analyze" && (
                <AnalysisView
                  creator={activeCreator}
                  analysis={analysis}
                  onAnalyze={handleAnalyze}
                  onContinue={() => {
                    advanceTo("opportunities");
                    setCurrentStep("opportunities");
                  }}
                  loading={analyzeLoading}
                />
              )}

              {currentStep === "opportunities" && (
                <OpportunitiesView
                  creator={activeCreator}
                  analysisId={analysis?.id ?? 0}
                  opportunities={opportunities}
                  onDiscover={handleDiscoverOpportunities}
                  onSelect={handleSelectOpportunity}
                  loading={opportunitiesLoading}
                />
              )}

              {currentStep === "recommend" && (
                <RecommendationView
                  recommendation={recommendation}
                  whyThisOne={whyThisOne}
                  selectedOpportunity={selectedOpportunity}
                  onGenerateWorkbook={handleGenerateWorkbook}
                  loading={recommendLoading}
                />
              )}

              {currentStep === "workbook" && (
                <WorkbookView
                  workbook={workbook}
                  loading={workbookLoading}
                  onBrand={handleBrand}
                  branding={brandingLoading}
                />
              )}

              {currentStep === "brand" && (
                <div className="space-y-6">
                  <BrandingView
                    brandingBrief={brandingBrief}
                    loading={brandingLoading}
                    onGenerate={handleBrand}
                    creatorName={activeCreator.name}
                  />
                  {brandingBrief && (
                    <div className="flex justify-between pt-4 border-t border-rule">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setCurrentStep("workbook");
                        }}
                      >
                        ← View Workbook
                      </Button>
                      <Button
                        onClick={() => {
                          advanceTo("outreach");
                          setCurrentStep("outreach");
                        }}
                      >
                        Generate Outreach →
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {currentStep === "outreach" && (
                <div className="space-y-6">
                  <OutreachView
                    drafts={outreachDrafts}
                    loading={outreachLoading}
                    onGenerate={handleGenerateOutreach}
                    creatorName={activeCreator.name}
                  />
                  {outreachDrafts.length > 0 && (
                    <div className="flex justify-end pt-4 border-t border-rule">
                      <Button
                        onClick={() => {
                          advanceTo("report");
                          setCurrentStep("report");
                        }}
                      >
                        Export Report →
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {currentStep === "report" && (
                <ReportView
                  creatorId={activeCreator.id}
                  creatorName={activeCreator.name}
                />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
