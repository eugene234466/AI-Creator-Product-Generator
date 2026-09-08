"use client";

import { useState } from "react";
import Input from "./Input";
import Button from "./Button";
import Card from "./Card";
import { User, Link, FileText, Users } from "lucide-react";

type CreatorFormData = {
  name: string;
  niche: string;
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  description: string;
  manualPosts: string;
  audienceInfo: string;
};

type Props = {
  onCreated: (creator: { id: number; name: string; niche: string }) => void;
};

export default function CreatorForm({ onCreated }: Props) {
  const [form, setForm] = useState<CreatorFormData>({
    name: "",
    niche: "",
    instagramUrl: "",
    tiktokUrl: "",
    youtubeUrl: "",
    description: "",
    manualPosts: "",
    audienceInfo: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [section, setSection] = useState<"basic" | "urls" | "content">("basic");

  const set = (key: keyof CreatorFormData) => (v: string) =>
    setForm((f) => ({ ...f, [key]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.niche) {
      setError("Creator name and niche are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/creators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onCreated(data.creator);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save creator");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: "basic" as const, label: "Basic Info", icon: User },
    { key: "urls" as const, label: "Profile URLs", icon: Link },
    { key: "content" as const, label: "Content & Audience", icon: FileText },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-100">Add Creator</h2>
        <p className="text-sm text-slate-400 mt-1">
          Enter as much information as you have. The more context, the better the analysis.
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-slate-900/60 p-1 rounded-lg border border-slate-800">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSection(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2 px-3 rounded-md font-medium transition-all ${
              section === key
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      <Card>
        {section === "basic" && (
          <div className="space-y-4">
            <Input
              label="Creator Name"
              required
              placeholder="e.g. Alex Hormozi, Zoe Sugg"
              value={form.name}
              onChange={set("name")}
            />
            <Input
              label="Primary Niche"
              required
              placeholder="e.g. Fitness, Personal Finance, Productivity, Cooking"
              value={form.niche}
              onChange={set("niche")}
            />
            <Input
              label="Creator Description"
              placeholder="Optional: Describe what this creator is known for, their style, audience size..."
              value={form.description}
              onChange={set("description")}
              multiline
              rows={3}
              hint="The more context you give, the better the AI can analyze opportunities."
            />
          </div>
        )}

        {section === "urls" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <p className="text-xs text-slate-400">
                URLs are for reference context only. The AI will not scrape these pages.
              </p>
            </div>
            <Input
              label="Instagram URL"
              placeholder="https://instagram.com/username"
              value={form.instagramUrl}
              onChange={set("instagramUrl")}
              type="url"
            />
            <Input
              label="TikTok URL"
              placeholder="https://tiktok.com/@username"
              value={form.tiktokUrl}
              onChange={set("tiktokUrl")}
              type="url"
            />
            <Input
              label="YouTube URL"
              placeholder="https://youtube.com/@channel"
              value={form.youtubeUrl}
              onChange={set("youtubeUrl")}
              type="url"
            />
          </div>
        )}

        {section === "content" && (
          <div className="space-y-4">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <FileText size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-300">
                Paste actual posts, captions, video descriptions, or comments here. This is the most valuable input for analysis.
              </p>
            </div>
            <Input
              label="Manually Pasted Posts / Captions"
              placeholder="Paste any creator posts, YouTube descriptions, tweets, captions, or comments here. The more the better."
              value={form.manualPosts}
              onChange={set("manualPosts")}
              multiline
              rows={8}
              hint="Separate multiple posts with ---"
            />
            <Input
              label="Audience Information"
              placeholder="e.g. Mostly 25–35 year old women interested in budget cooking. Often ask about meal prep and saving money. Lots of comments about being overwhelmed."
              value={form.audienceInfo}
              onChange={set("audienceInfo")}
              multiline
              rows={4}
              hint="What do you know about this creator's audience? Paste any audience comments or demographics."
            />
          </div>
        )}
      </Card>

      {error && (
        <p className="text-sm text-red-400 flex items-center gap-2">
          <span>⚠</span> {error}
        </p>
      )}

      <div className="flex justify-between">
        <div className="flex gap-2">
          {section !== "basic" && (
            <Button
              variant="secondary"
              onClick={() => setSection(section === "content" ? "urls" : "basic")}
            >
              ← Back
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {section !== "content" ? (
            <Button
              onClick={() => setSection(section === "basic" ? "urls" : "content")}
            >
              Next →
            </Button>
          ) : (
            <Button onClick={handleSubmit} loading={loading}>
              Save & Start Analysis →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
