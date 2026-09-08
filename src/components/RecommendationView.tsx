"use client";

import Card from "./Card";
import Badge from "./Badge";
import Button from "./Button";
import LoadingState from "./LoadingState";
import { Package, DollarSign, Star, ArrowRight, Users, Zap } from "lucide-react";

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

type Props = {
  recommendation: Recommendation | null;
  whyThisOne?: string;
  selectedOpportunity: { productIdea: string; overallScore: number } | null;
  onGenerateWorkbook: () => Promise<void>;
  loading: boolean;
};

export default function RecommendationView({
  recommendation: rec,
  whyThisOne,
  selectedOpportunity,
  onGenerateWorkbook,
  loading,
}: Props) {
  if (!rec && !loading) {
    return (
      <Card className="text-center py-12">
        <Package size={32} className="text-slate-500 mx-auto mb-3" />
        <p className="text-slate-400">Select an opportunity to generate a product recommendation.</p>
      </Card>
    );
  }

  if (loading) {
    return (
      <LoadingState
        message="Building product recommendation..."
        steps={[
          "Selecting strongest opportunity",
          "Defining product positioning",
          "Crafting unique angle",
          "Structuring product contents",
          "Writing distribution rationale",
        ]}
      />
    );
  }

  if (!rec) return null;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-100">Product Recommendation</h2>
        {selectedOpportunity && (
          <p className="text-sm text-slate-400 mt-0.5">
            Based on: {selectedOpportunity.productIdea} (Score: {Math.round(selectedOpportunity.overallScore)})
          </p>
        )}
      </div>

      {/* Why this one */}
      {whyThisOne && (
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Star size={14} className="text-indigo-400" />
            <h3 className="text-sm font-semibold text-indigo-300">Why This Opportunity?</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{whyThisOne}</p>
        </div>
      )}

      {/* Product card */}
      <Card glow>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="indigo">{rec.productType}</Badge>
            </div>
            <h3 className="text-xl font-bold text-slate-100">{rec.productName}</h3>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-2xl font-bold text-emerald-400">${rec.recommendedPrice}</p>
            <p className="text-xs text-slate-500">recommended price</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Users size={12} className="text-slate-500" />
              <p className="text-xs text-slate-500 font-medium">Target Customer</p>
            </div>
            <p className="text-sm text-slate-300">{rec.targetCustomer}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Zap size={12} className="text-slate-500" />
              <p className="text-xs text-slate-500 font-medium">Core Problem</p>
            </div>
            <p className="text-sm text-slate-300">{rec.coreProblem}</p>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-xs text-emerald-400 font-medium mb-1">Transformation</p>
          <p className="text-sm text-slate-300">{rec.transformation}</p>
        </div>

        <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-xs text-amber-400 font-medium mb-1">Unique Angle</p>
          <p className="text-sm text-slate-300">{rec.uniqueAngle}</p>
        </div>
      </Card>

      {/* Contents */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Package size={14} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-200">Recommended Contents</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {rec.recommendedContents?.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </Card>

      {/* Why this creator */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <DollarSign size={14} className="text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-200">Why This Creator is the Right Distribution Partner</h3>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">{rec.whyThisCreator}</p>
      </Card>

      {/* Generate workbook CTA */}
      <div className="flex justify-center">
        <Button onClick={onGenerateWorkbook} loading={loading} size="lg">
          <span className="text-base">📒</span>
          Generate Workbook
          <ArrowRight size={14} />
        </Button>
      </div>
    </div>
  );
}
