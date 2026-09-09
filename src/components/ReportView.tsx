"use client";

import { useState } from "react";
import Card from "./Card";
import Badge from "./Badge";
import Button from "./Button";
import ScoreRing from "./ScoreRing";
import { FileDown, Loader2 } from "lucide-react";

type Report = {
  creator: { id: number; name: string; niche: string; urls: string[]; description: string | null };
  niche: string;
  subNiches: string[];
  audience: string;
  topContentThemes: string[];
  audienceProblems: string[];
  audienceDesires: string[];
  buyingIntentSignals: string[];
  contentPopularityNotes: string;
  monetizationPotentialNotes: string;
  opportunities: Array<{
    id: number;
    productIdea: string;
    suggestedFormat: string | null;
    overallScore: number | null;
    creatorProductScore: number | null;
    difficulty: string | null;
    priceRangeLow: number | null;
    priceRangeHigh: number | null;
    isSelected: number | null;
  }>;
  selectedOpportunity: {
    productIdea: string;
    problemSolved: string | null;
    desiredOutcome: string | null;
    overallScore: number | null;
    creatorProductScore: number | null;
  } | null;
  recommendedProduct: {
    productName: string;
    productType: string;
    targetCustomer: string | null;
    coreProblem: string | null;
    transformation: string | null;
    uniqueAngle: string | null;
    recommendedPrice: number | null;
    recommendedContents: string[];
    whyThisCreator: string | null;
  } | null;
  workbook: {
    title: string;
    subtitle: string | null;
    isBranded: number | null;
    sectionCount: number;
    sectionTitles: string[];
  } | null;
  brandingBrief: {
    tone: string | null;
    contentStyle: string | null;
    audienceSophistication: string | null;
    visualDirection: string | null;
    positioning: string | null;
    productNamingStyle: string | null;
    ctaStyle: string | null;
    disclaimer: string | null;
  } | null;
  outreachDrafts: Array<{
    platform: string | null;
    tone: string | null;
    subject: string | null;
    message: string;
  }>;
  generatedAt: string;
};

type Props = {
  creatorId: number;
  creatorName: string;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-parchment-faint">{title}</h3>
      {children}
    </div>
  );
}

export default function ReportView({ creatorId, creatorName }: Props) {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/report?creatorId=${creatorId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReport(data.report);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;
    const text = generateTextReport(report);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.creator.name.replace(/\s+/g, "_")}_opportunity_report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadJSON = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.creator.name.replace(/\s+/g, "_")}_opportunity_report.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-display font-medium text-parchment">Opportunity Report</h2>
          <p className="text-sm text-parchment-dim mt-0.5">{creatorName}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchReport} loading={loading} variant="secondary">
            {loading ? <Loader2 size={13} className="animate-spin" /> : null}
            Load Report
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-brick">⚠ {error}</p>}

      {!report && !loading && (
        <Card className="text-center py-12">
          <FileDown size={32} className="text-parchment-faint mx-auto mb-3" />
          <p className="text-parchment-dim font-medium">Opportunity Report</p>
          <p className="text-sm text-parchment-faint mt-1 mb-4">
            Compiles all analysis, opportunities, product recommendation, workbook outline, and outreach drafts into one report.
          </p>
          <Button onClick={fetchReport} loading={loading}>
            <FileDown size={14} />
            Generate Report
          </Button>
        </Card>
      )}

      {report && (
        <div className="space-y-6">
          {/* Export buttons */}
          <div className="flex gap-2">
            <Button onClick={downloadReport} variant="secondary" size="sm">
              <FileDown size={13} />
              Export as Text
            </Button>
            <Button onClick={downloadJSON} variant="secondary" size="sm">
              <FileDown size={13} />
              Export as JSON
            </Button>
          </div>

          {/* Creator */}
          <Section title="Creator">
            <Card>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-parchment">{report.creator.name}</h3>
                  <p className="text-sm text-parchment-dim">{report.niche}</p>
                  {report.subNiches.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {report.subNiches.map((n, i) => <Badge key={i} variant="slate">{n}</Badge>)}
                    </div>
                  )}
                </div>
                <div className="text-right text-xs text-parchment-faint">
                  {report.creator.urls.map((url, i) => (
                    <div key={i}>{url}</div>
                  ))}
                </div>
              </div>
              {report.audience !== "Not specified" && (
                <p className="text-xs text-parchment-dim mt-3 pt-3 border-t border-rule">{report.audience}</p>
              )}
            </Card>
          </Section>

          {/* Content themes */}
          <Section title="Top Content Themes">
            <Card>
              <div className="flex flex-wrap gap-1.5">
                {report.topContentThemes.map((t, i) => (
                  <Badge key={i} variant="slate">{t}</Badge>
                ))}
              </div>
            </Card>
          </Section>

          {/* Audience problems */}
          <Section title="Audience Problems">
            <Card>
              <div className="space-y-1.5">
                {report.audienceProblems.map((p, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-parchment-dim">
                    <span className="text-brick">•</span>
                    {p}
                  </div>
                ))}
              </div>
            </Card>
          </Section>

          {/* Buying intent signals */}
          <Section title="Buying Intent Signals">
            <Card>
              <div className="space-y-1.5">
                {report.buyingIntentSignals.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-parchment-dim">
                    <span className="text-amber">💰</span>
                    {s}
                  </div>
                ))}
                {report.buyingIntentSignals.length === 0 && (
                  <p className="text-sm text-parchment-faint italic">No clear signals detected</p>
                )}
              </div>
            </Card>
          </Section>

          {/* Opportunities */}
          <Section title="Opportunities">
            <div className="space-y-2">
              {report.opportunities.map((opp) => (
                <Card key={opp.id} className={opp.isSelected === 1 ? "border-teal/30" : ""}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-parchment">{opp.productIdea}</p>
                        {opp.isSelected === 1 && <Badge variant="emerald">Selected</Badge>}
                        {opp.suggestedFormat && <Badge variant="slate">{opp.suggestedFormat}</Badge>}
                      </div>
                      <p className="text-xs text-parchment-faint mt-0.5">
                        ${opp.priceRangeLow}–${opp.priceRangeHigh} · {opp.difficulty}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <ScoreRing score={opp.overallScore ?? 0} size={48} label="Score" />
                      <ScoreRing score={opp.creatorProductScore ?? 0} size={48} label="Fit" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Section>

          {/* Recommended product */}
          {report.recommendedProduct && (
            <Section title="Recommended Product">
              <Card glow>
                <div className="flex flex-wrap justify-between items-start gap-3">
                  <div>
                    <Badge variant="slate">{report.recommendedProduct.productType}</Badge>
                    <h3 className="text-lg font-display font-medium text-parchment mt-1">{report.recommendedProduct.productName}</h3>
                    <p className="text-sm text-parchment-dim">{report.recommendedProduct.targetCustomer}</p>
                  </div>
                  <p className="text-xl font-figures font-semibold text-teal">${report.recommendedProduct.recommendedPrice}</p>
                </div>
                {report.recommendedProduct.transformation && (
                  <p className="text-sm text-parchment-dim mt-3">{report.recommendedProduct.transformation}</p>
                )}
              </Card>
            </Section>
          )}

          {/* Workbook outline */}
          {report.workbook && (
            <Section title="Workbook Outline">
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-parchment">{report.workbook.title}</h3>
                  {report.workbook.isBranded === 1 && <Badge variant="purple">Branded</Badge>}
                </div>
                {report.workbook.subtitle && (
                  <p className="text-xs text-parchment-dim mb-3">{report.workbook.subtitle}</p>
                )}
                <div className="space-y-1">
                  {report.workbook.sectionTitles.map((title, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-parchment-dim">
                      <span className="text-parchment-faint">{i + 1}.</span>
                      {title}
                    </div>
                  ))}
                </div>
              </Card>
            </Section>
          )}

          {/* Branding brief */}
          {report.brandingBrief && (
            <Section title="Branding Brief">
              <Card>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-parchment-faint">Tone</p>
                    <p className="text-parchment-dim">{report.brandingBrief.tone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-parchment-faint">Audience Level</p>
                    <p className="text-parchment-dim">{report.brandingBrief.audienceSophistication}</p>
                  </div>
                  <div>
                    <p className="text-xs text-parchment-faint">Positioning</p>
                    <p className="text-parchment-dim">{report.brandingBrief.positioning}</p>
                  </div>
                  <div>
                    <p className="text-xs text-parchment-faint">CTA Style</p>
                    <p className="text-parchment-dim">{report.brandingBrief.ctaStyle}</p>
                  </div>
                </div>
                {report.brandingBrief.disclaimer && (
                  <p className="text-xs text-amber mt-3 pt-3 border-t border-rule">{report.brandingBrief.disclaimer}</p>
                )}
              </Card>
            </Section>
          )}

          {/* Outreach drafts */}
          {report.outreachDrafts.length > 0 && (
            <Section title="Outreach Drafts">
              <div className="space-y-3">
                {report.outreachDrafts.map((draft, i) => (
                  <Card key={i}>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="slate">{draft.platform}</Badge>
                      <Badge variant="slate">{draft.tone}</Badge>
                    </div>
                    {draft.subject && (
                      <p className="text-xs text-parchment-faint mb-1">Subject: <span className="text-parchment-dim">{draft.subject}</span></p>
                    )}
                    <p className="text-xs text-parchment-dim line-clamp-3 leading-relaxed">{draft.message}</p>
                  </Card>
                ))}
              </div>
            </Section>
          )}

          <p className="text-xs text-parchment-faint text-center">
            Report generated {new Date(report.generatedAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}

function generateTextReport(report: Report): string {
  const lines: string[] = [];
  const divider = "=".repeat(60);
  const sep = "-".repeat(40);

  lines.push(divider);
  lines.push("CREATOR OPPORTUNITY REPORT");
  lines.push(`Generated: ${new Date(report.generatedAt).toLocaleString()}`);
  lines.push(divider);
  lines.push("");

  lines.push("CREATOR");
  lines.push(sep);
  lines.push(`Name: ${report.creator.name}`);
  lines.push(`Niche: ${report.niche}`);
  if (report.subNiches.length > 0) lines.push(`Sub-niches: ${report.subNiches.join(", ")}`);
  if (report.creator.urls.length > 0) lines.push(`URLs: ${report.creator.urls.join(", ")}`);
  lines.push(`Audience: ${report.audience}`);
  lines.push("");

  lines.push("TOP CONTENT THEMES");
  lines.push(sep);
  report.topContentThemes.forEach((t) => lines.push(`• ${t}`));
  lines.push("");

  lines.push("AUDIENCE PROBLEMS");
  lines.push(sep);
  report.audienceProblems.forEach((p) => lines.push(`• ${p}`));
  lines.push("");

  lines.push("BUYING INTENT SIGNALS");
  lines.push(sep);
  report.buyingIntentSignals.forEach((s) => lines.push(`• ${s}`));
  lines.push("");

  lines.push("OPPORTUNITIES");
  lines.push(sep);
  report.opportunities.forEach((opp, i) => {
    lines.push(`${i + 1}. ${opp.productIdea}`);
    lines.push(`   Format: ${opp.suggestedFormat} | Price: $${opp.priceRangeLow}–$${opp.priceRangeHigh} | Difficulty: ${opp.difficulty}`);
    lines.push(`   Overall Score: ${Math.round(opp.overallScore ?? 0)}/100 | Creator Fit: ${Math.round(opp.creatorProductScore ?? 0)}/100`);
    if (opp.isSelected === 1) lines.push(`   *** SELECTED ***`);
  });
  lines.push("");

  if (report.recommendedProduct) {
    lines.push("RECOMMENDED PRODUCT");
    lines.push(sep);
    const p = report.recommendedProduct;
    lines.push(`Product: ${p.productName}`);
    lines.push(`Type: ${p.productType}`);
    lines.push(`Price: $${p.recommendedPrice}`);
    lines.push(`Target: ${p.targetCustomer}`);
    lines.push(`Problem: ${p.coreProblem}`);
    lines.push(`Transformation: ${p.transformation}`);
    lines.push(`Unique Angle: ${p.uniqueAngle}`);
    lines.push("Contents:");
    (p.recommendedContents ?? []).forEach((c) => lines.push(`  • ${c}`));
    lines.push("");
  }

  if (report.workbook) {
    lines.push("WORKBOOK OUTLINE");
    lines.push(sep);
    lines.push(`Title: ${report.workbook.title}`);
    if (report.workbook.subtitle) lines.push(`Subtitle: ${report.workbook.subtitle}`);
    lines.push(`Branded: ${report.workbook.isBranded === 1 ? "Yes" : "No"}`);
    lines.push("Sections:");
    report.workbook.sectionTitles.forEach((t, i) => lines.push(`  ${i + 1}. ${t}`));
    lines.push("");
  }

  if (report.brandingBrief) {
    lines.push("BRANDING BRIEF");
    lines.push(sep);
    const b = report.brandingBrief;
    if (b.tone) lines.push(`Tone: ${b.tone}`);
    if (b.audienceSophistication) lines.push(`Audience Level: ${b.audienceSophistication}`);
    if (b.positioning) lines.push(`Positioning: ${b.positioning}`);
    if (b.ctaStyle) lines.push(`CTA Style: ${b.ctaStyle}`);
    if (b.disclaimer) lines.push(`\nNOTE: ${b.disclaimer}`);
    lines.push("");
  }

  if (report.outreachDrafts.length > 0) {
    lines.push("OUTREACH DRAFTS");
    lines.push(sep);
    lines.push("NOTE: These are drafts for human review only. Do not send automatically.");
    lines.push("");
    report.outreachDrafts.forEach((d, i) => {
      lines.push(`Draft ${i + 1} — ${d.platform} (${d.tone})`);
      if (d.subject) lines.push(`Subject: ${d.subject}`);
      lines.push(d.message);
      lines.push("");
    });
  }

  lines.push(divider);
  lines.push("END OF REPORT");

  return lines.join("\n");
}
