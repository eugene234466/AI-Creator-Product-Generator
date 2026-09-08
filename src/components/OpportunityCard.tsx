"use client";

import { useState } from "react";
import Card from "./Card";
import Badge from "./Badge";
import ScoreRing from "./ScoreRing";
import ScoreBar from "./ScoreBar";
import Button from "./Button";
import { formatPrice, difficultyColor, scoreColor } from "@/lib/utils";
import { ChevronDown, ChevronUp, CheckCircle } from "lucide-react";

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
  opportunity: Opportunity;
  rank: number;
  onSelect: (id: number) => void;
  isSelecting: boolean;
};

export default function OpportunityCard({ opportunity: opp, rank, onSelect, isSelecting }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showScores, setShowScores] = useState(false);

  const scoreItems = [
    { label: "Audience Fit", score: opp.scoreAudienceFit, key: "audienceFit" },
    { label: "Problem Severity", score: opp.scoreProblemSeverity, key: "problemSeverity" },
    { label: "Evidence of Demand", score: opp.scoreEvidenceOfDemand, key: "evidenceOfDemand" },
    { label: "Buying Intent", score: opp.scoreBuyingIntent, key: "buyingIntent" },
    { label: "Content Performance", score: opp.scoreContentPerformance, key: "contentPerformance" },
    { label: "Creator Authority", score: opp.scoreCreatorAuthority, key: "creatorAuthority" },
    { label: "Competition (lower = better)", score: opp.scoreCompetition, key: "competition" },
    { label: "Differentiation", score: opp.scoreDifferentiation, key: "differentiation" },
    { label: "Ease of Creation", score: opp.scoreEaseOfCreation, key: "easeOfCreation" },
    { label: "Monetization Potential", score: opp.scoreMonetizationPotential, key: "monetizationPotential" },
  ];

  const cpBreakdown = opp.creatorProductScoreBreakdown as Record<string, string | number>;

  return (
    <Card
      className={opp.isSelected === 1 ? "border-indigo-500/40 ring-1 ring-indigo-500/20" : ""}
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-400">
          {rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="font-semibold text-slate-100 leading-snug">{opp.productIdea}</h3>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <Badge variant="indigo">{opp.suggestedFormat}</Badge>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${difficultyColor(opp.difficulty)}`}>
                  {opp.difficulty}
                </span>
                <span className="text-xs text-slate-400">{formatPrice(opp.priceRangeLow, opp.priceRangeHigh)}</span>
                {opp.isSelected === 1 && (
                  <Badge variant="emerald">
                    <CheckCircle size={10} className="mr-1" />
                    Selected
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <ScoreRing score={opp.overallScore ?? 0} size={64} label="Overall" />
              <ScoreRing score={opp.creatorProductScore ?? 0} size={64} label="Creator Fit" />
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <p className="text-xs text-slate-500 font-medium">Target Audience</p>
          <p className="text-xs text-slate-300">{opp.targetAudience}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-slate-500 font-medium">Problem Solved</p>
          <p className="text-xs text-slate-300">{opp.problemSolved}</p>
        </div>
      </div>

      {/* Expand */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 mt-3 transition-colors"
      >
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        {expanded ? "Show less" : "Show full details"}
      </button>

      {expanded && (
        <div className="mt-4 space-y-4 border-t border-slate-800 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">Desired Outcome</p>
              <p className="text-xs text-slate-300">{opp.desiredOutcome}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">Creator Credibility</p>
              <p className="text-xs text-slate-300">{opp.creatorCredibility}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">Existing Alternatives</p>
              <p className="text-xs text-slate-300">{opp.existingAlternatives}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">Differentiation</p>
              <p className="text-xs text-slate-300">{opp.differentiation}</p>
            </div>
          </div>

          {/* Evidence signals */}
          <div>
            <p className="text-xs text-slate-500 font-medium mb-2">Evidence Signals</p>
            <div className="space-y-1">
              {opp.evidenceSignals?.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                  <span className="text-indigo-400 mt-0.5">→</span>
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Score breakdown */}
          <div>
            <button
              onClick={() => setShowScores(!showScores)}
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 mb-3 transition-colors"
            >
              {showScores ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {showScores ? "Hide" : "Show"} score breakdown (10 factors)
            </button>
            {showScores && (
              <div className="space-y-3 p-3 rounded-lg bg-slate-900/50">
                {scoreItems.map(({ label, score, key }) => (
                  <ScoreBar
                    key={key}
                    label={label}
                    score={score}
                    explanation={opp.scoreExplanations?.[key]}
                  />
                ))}
                <div className="pt-2 border-t border-slate-800">
                  <p className="text-xs text-slate-500 font-medium">Overall Score (average of above)</p>
                  <p className={`text-xl font-bold ${scoreColor(opp.overallScore ?? 0)}`}>
                    {Math.round(opp.overallScore ?? 0)} / 100
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Creator × Product fit */}
          <div className="p-3 rounded-lg bg-slate-900/50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-300">Creator × Product Fit</p>
              <span className={`text-lg font-bold ${scoreColor(opp.creatorProductScore ?? 0)}`}>
                {Math.round(opp.creatorProductScore ?? 0)}/100
              </span>
            </div>
            {cpBreakdown && (
              <div className="grid grid-cols-3 gap-2 mb-2">
                {["audienceOverlap", "topicOverlap", "creatorAuthority", "contentCompatibility", "audienceProblemAlignment", "promotionPotential"].map((key) => {
                  const val = cpBreakdown[key];
                  if (typeof val !== "number") return null;
                  return (
                    <div key={key} className="text-center">
                      <p className={`text-sm font-semibold ${scoreColor(val)}`}>{val}</p>
                      <p className="text-xs text-slate-600 leading-tight">{key.replace(/([A-Z])/g, " $1").trim()}</p>
                    </div>
                  );
                })}
              </div>
            )}
            {cpBreakdown?.explanation && (
              <p className="text-xs text-slate-400">{String(cpBreakdown.explanation)}</p>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
        <Button
          onClick={() => onSelect(opp.id)}
          loading={isSelecting}
          variant={opp.isSelected === 1 ? "success" : "primary"}
          size="sm"
        >
          {opp.isSelected === 1 ? <CheckCircle size={13} /> : null}
          {opp.isSelected === 1 ? "Selected — Build Recommendation →" : "Select This Opportunity →"}
        </Button>
      </div>
    </Card>
  );
}
