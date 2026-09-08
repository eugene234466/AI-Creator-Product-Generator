"use client";

import { useState } from "react";
import Button from "./Button";
import LoadingState from "./LoadingState";
import OpportunityCard from "./OpportunityCard";
import Card from "./Card";
import { Lightbulb } from "lucide-react";

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

type Props = {
  creator: { id: number; name: string; niche: string };
  analysisId: number;
  opportunities: Opportunity[];
  onDiscover: () => Promise<void>;
  onSelect: (opportunityId: number) => Promise<void>;
  loading: boolean;
};

export default function OpportunitiesView({
  creator,
  analysisId: _analysisId,
  opportunities,
  onDiscover,
  onSelect,
  loading,
}: Props) {
  const [selectingId, setSelectingId] = useState<number | null>(null);

  const handleSelect = async (id: number) => {
    setSelectingId(id);
    await onSelect(id);
    setSelectingId(null);
  };

  const sorted = [...opportunities].sort((a, b) => (b.overallScore ?? 0) - (a.overallScore ?? 0));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">Product Opportunities</h2>
          <p className="text-sm text-slate-400 mt-0.5">{creator.name} · {opportunities.length} opportunity{opportunities.length !== 1 ? "s" : ""} found</p>
        </div>
        <div className="flex gap-2">
          {opportunities.length > 0 && (
            <Button variant="secondary" size="sm" onClick={onDiscover} loading={loading}>
              Regenerate
            </Button>
          )}
          {opportunities.length === 0 && !loading && (
            <Button onClick={onDiscover} loading={loading}>
              <Lightbulb size={14} />
              Discover Opportunities
            </Button>
          )}
        </div>
      </div>

      {loading && (
        <LoadingState
          message="Discovering product opportunities..."
          steps={[
            "Analyzing audience problems against market gaps",
            "Generating 3–5 product concepts",
            "Scoring each opportunity across 10 factors",
            "Calculating Creator × Product Fit scores",
            "Separating buying intent from content performance",
          ]}
        />
      )}

      {!loading && opportunities.length === 0 && (
        <Card className="text-center py-12">
          <Lightbulb size={32} className="text-indigo-400 mx-auto mb-3" />
          <p className="text-slate-300 font-medium">No opportunities yet</p>
          <p className="text-sm text-slate-500 mt-1">
            Click &quot;Discover Opportunities&quot; to generate 3–5 product ideas from the analysis.
          </p>
        </Card>
      )}

      {!loading && sorted.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <span className="text-amber-400 text-sm">⚡</span>
            <p className="text-xs text-amber-300">
              Select an opportunity to generate a full product recommendation and workbook.
              The &quot;Creator Fit&quot; score measures how naturally the creator could promote this product — separate from overall quality.
            </p>
          </div>
          {sorted.map((opp, i) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              rank={i + 1}
              onSelect={handleSelect}
              isSelecting={selectingId === opp.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
