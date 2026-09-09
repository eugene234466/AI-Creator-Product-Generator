"use client";

import { useState } from "react";
import Card from "./Card";
import Badge from "./Badge";
import Button from "./Button";
import LoadingState from "./LoadingState";
import { MessageSquare, Copy, Check, Mail } from "lucide-react";

type OutreachDraft = {
  id: number;
  subject: string | null;
  message: string;
  platform: string;
  tone: string;
};

type Props = {
  drafts: OutreachDraft[];
  loading: boolean;
  onGenerate: () => Promise<void>;
  creatorName: string;
};

const platformIcon = {
  email: Mail,
  instagram_dm: MessageSquare,
  twitter_dm: MessageSquare,
};

const platformLabel = {
  email: "Email",
  instagram_dm: "Instagram DM",
  twitter_dm: "Twitter DM",
};

const platformBadge = {
  email: "blue" as const,
  instagram_dm: "purple" as const,
  twitter_dm: "slate" as const,
};

const toneBadge = {
  professional: "slate" as const,
  casual: "indigo" as const,
  enthusiastic: "amber" as const,
};

function DraftCard({ draft }: { draft: OutreachDraft }) {
  const [copied, setCopied] = useState(false);
  const Icon = platformIcon[draft.platform as keyof typeof platformIcon] ?? MessageSquare;
  const label = platformLabel[draft.platform as keyof typeof platformLabel] ?? draft.platform;
  const badge = platformBadge[draft.platform as keyof typeof platformBadge] ?? "slate";
  const toneBadgeVariant = toneBadge[draft.tone as keyof typeof toneBadge] ?? "slate";

  const copy = async () => {
    const text = draft.subject
      ? `Subject: ${draft.subject}\n\n${draft.message}`
      : draft.message;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-parchment-dim" />
          <Badge variant={badge}>{label}</Badge>
          <Badge variant={toneBadgeVariant}>{draft.tone}</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={copy}>
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>

      {draft.subject && (
        <div className="p-2 rounded-[3px] bg-ink-950 border border-rule">
          <p className="text-xs text-parchment-faint mb-0.5">Subject line</p>
          <p className="text-sm font-medium text-parchment">{draft.subject}</p>
        </div>
      )}

      <div className="p-3 rounded-[3px] bg-ink-950 border border-rule">
        <p className="text-sm text-parchment-dim whitespace-pre-line leading-relaxed">{draft.message}</p>
      </div>

      <p className="text-xs text-parchment-faint italic">
        ⚠ Draft only — review before sending. Do not send automatically.
      </p>
    </Card>
  );
}

export default function OutreachView({ drafts, loading, onGenerate, creatorName }: Props) {
  if (loading) {
    return (
      <LoadingState
        message="Writing outreach drafts..."
        steps={[
          "Analyzing creator specifics",
          "Identifying strongest hook",
          "Writing professional email draft",
          "Writing casual DM draft",
          "Writing enthusiastic pitch draft",
        ]}
      />
    );
  }

  if (drafts.length === 0) {
    return (
      <Card className="text-center py-12">
        <MessageSquare size={32} className="text-amber mx-auto mb-3" />
        <p className="text-parchment-dim font-medium">Partnership Outreach Drafts</p>
        <p className="text-sm text-parchment-faint mt-1 mb-4">
          Generate 2–3 personalized outreach messages for {creatorName}.<br />
          These are drafts for human review only — not sent automatically.
        </p>
        <Button onClick={onGenerate}>
          <MessageSquare size={14} />
          Generate Outreach Drafts
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-display font-medium text-parchment">Outreach Drafts</h2>
          <p className="text-sm text-parchment-dim mt-0.5">{creatorName} · {drafts.length} draft{drafts.length !== 1 ? "s" : ""}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={onGenerate} loading={loading}>
          Regenerate
        </Button>
      </div>

      <div className="p-3 rounded-[3px] bg-brick-dim border border-brick/20">
        <p className="text-xs text-brick">
          🚫 <strong>Do not send these automatically.</strong> These are drafts for your review only.
          Personalize further before sending. Review all claims for accuracy.
        </p>
      </div>

      <div className="space-y-4">
        {drafts.map((draft) => (
          <DraftCard key={draft.id} draft={draft} />
        ))}
      </div>
    </div>
  );
}
