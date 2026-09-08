"use client";

import Card from "./Card";
import Badge from "./Badge";
import Button from "./Button";
import LoadingState from "./LoadingState";
import { Palette, MessageSquare, Eye, Type, Target, AlertCircle } from "lucide-react";

type BrandingBrief = {
  tone: string;
  vocabularyTendencies: string[];
  contentStyle: string;
  audienceSophistication: string;
  visualDirection: string;
  positioning: string;
  productNamingStyle: string;
  ctaStyle: string;
  audienceExamples: string[];
  disclaimer: string;
};

type Props = {
  brandingBrief: BrandingBrief | null;
  loading: boolean;
  onGenerate: () => Promise<void>;
  creatorName: string;
};

export default function BrandingView({ brandingBrief: brief, loading, onGenerate, creatorName }: Props) {
  if (loading) {
    return (
      <LoadingState
        message="Generating branding brief..."
        steps={[
          "Analyzing creator's communication style",
          "Identifying audience sophistication level",
          "Defining vocabulary and tone guidelines",
          "Crafting visual direction",
          "Adapting workbook to creator's positioning",
        ]}
      />
    );
  }

  if (!brief) {
    return (
      <Card className="text-center py-12">
        <Palette size={32} className="text-purple-400 mx-auto mb-3" />
        <p className="text-slate-300 font-medium">Branding Brief</p>
        <p className="text-sm text-slate-500 mt-1 mb-4">
          Generate a branding brief to adapt the workbook&apos;s tone and positioning for {creatorName}&apos;s audience.
        </p>
        <Button onClick={onGenerate}>
          <Palette size={14} />
          Generate Branding Brief
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-100">Creator Branding Brief</h2>
        <p className="text-sm text-slate-400 mt-0.5">{creatorName}</p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <AlertCircle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-300 leading-relaxed">{brief.disclaimer}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Tone */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare size={13} className="text-blue-400" />
            <h3 className="text-sm font-semibold text-slate-200">Tone</h3>
          </div>
          <p className="text-sm text-slate-300">{brief.tone}</p>
        </Card>

        {/* Audience sophistication */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Target size={13} className="text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-200">Audience Sophistication</h3>
          </div>
          <Badge variant={
            brief.audienceSophistication === "advanced" ? "emerald" :
            brief.audienceSophistication === "intermediate" ? "amber" :
            brief.audienceSophistication === "beginner" ? "blue" : "slate"
          }>
            {brief.audienceSophistication}
          </Badge>
          <p className="text-xs text-slate-400 mt-2">{brief.contentStyle}</p>
        </Card>

        {/* Vocabulary */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Type size={13} className="text-purple-400" />
            <h3 className="text-sm font-semibold text-slate-200">Vocabulary Tendencies</h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {brief.vocabularyTendencies.map((v, i) => (
              <Badge key={i} variant="purple">{v}</Badge>
            ))}
          </div>
        </Card>

        {/* Visual direction */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Eye size={13} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-200">Visual Direction</h3>
          </div>
          <p className="text-sm text-slate-300">{brief.visualDirection}</p>
        </Card>
      </div>

      {/* Positioning */}
      <Card className="border-indigo-500/20">
        <div className="flex items-center gap-2 mb-3">
          <Target size={13} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-200">Positioning</h3>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">{brief.positioning}</p>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {/* Naming style */}
        <Card>
          <h3 className="text-sm font-semibold text-slate-200 mb-2">Product Naming Style</h3>
          <p className="text-sm text-slate-300">{brief.productNamingStyle}</p>
        </Card>

        {/* CTA style */}
        <Card>
          <h3 className="text-sm font-semibold text-slate-200 mb-2">CTA Style</h3>
          <p className="text-sm text-slate-300">{brief.ctaStyle}</p>
        </Card>
      </div>

      {/* Audience examples */}
      {brief.audienceExamples && brief.audienceExamples.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-slate-200 mb-3">Example Phrases for This Audience</h3>
          <div className="space-y-2">
            {brief.audienceExamples.map((ex, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="text-indigo-400 mt-0.5">→</span>
                &ldquo;{ex}&rdquo;
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
