import { useEffect, useRef, useState } from "react";
import { ArrowRightLeft, FileText, Headphones, LoaderCircle, Search, Sparkles, UserRound } from "lucide-react";
import type { CallSession } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/lib/demo/store";
import { cn } from "@/lib/utils";

const SPEAKERS = ["All speakers", "Customer", "ResolveAI", "Human Agent"];

export default function CallTranscript({ call }: { call: CallSession }) {
  const [query, setQuery] = useState("");
  const [speaker, setSpeaker] = useState("All speakers");
  const [generating, setGenerating] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { report } = useDemo();

  useEffect(() => () => clearTimeout(timer.current), []);

  function generate() {
    setGenerating(true);
    timer.current = setTimeout(() => {
      report(call.id, "transcript");
      setGenerating(false);
    }, 700);
  }

  const segments = call.segments.filter((s) => (speaker === "All speakers" || s.speaker === speaker) && s.text.toLowerCase().includes(query.toLowerCase()));

  return (
    <section className="panel overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] p-5">
        <div>
          <h2 className="display flex items-center gap-2 text-sm font-semibold">
            <FileText className="size-4 text-primary" />
            Call transcript
            <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[9px] tracking-wider text-muted-foreground">SAMPLE</span>
          </h2>
          <p className="mt-1.5 text-[10px] text-muted-foreground">Every speaker, every detail. One continuous conversation.</p>
        </div>
        <Button variant="outline" size="sm" onClick={generate} disabled={generating || call.status === "Unavailable"}>
          {generating ? <LoaderCircle className="size-3 animate-spin" /> : <Sparkles className="size-3" />}
          {generating ? "Preparing preview…" : call.transcriptReady ? "Regenerate preview" : "Generate transcript"}
        </Button>
      </div>

      {call.transcriptReady && !generating && (
        <div className="flex flex-wrap gap-2 border-b border-white/[0.07] bg-white/[0.02] p-4">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-3.5 size-3.5 text-muted-foreground" />
            <Input aria-label="Search transcript" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find something in this conversation…" className="h-10 pl-9 text-xs" />
          </div>
          <select aria-label="Filter transcript speaker" value={speaker} onChange={(e) => setSpeaker(e.target.value)} className="h-10 max-w-full rounded-lg border border-white/[0.1] bg-card px-2 text-[11px]">
            {SPEAKERS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      )}

      <div aria-live="polite">
        {call.status === "Unavailable" ? (
          <p className="p-10 text-center text-xs text-muted-foreground">No transcript source is available for this demo call.</p>
        ) : generating ? (
          <div className="flex min-h-[300px] items-center justify-center gap-2 text-xs text-muted-foreground"><LoaderCircle className="size-4 animate-spin" />Preparing sample transcript — no audio is being processed.</div>
        ) : !call.transcriptReady ? (
          <div className="p-12 text-center">
            <FileText className="mx-auto size-7 text-muted-foreground" />
            <h3 className="display mt-4 text-sm font-semibold">The words behind the call.</h3>
            <p className="mx-auto mt-2 max-w-xs text-xs leading-6 text-muted-foreground">Generate the scripted preview to see a timestamped, speaker-labeled transcript. Real transcription connects later.</p>
          </div>
        ) : (
          <>
            {segments.length === 0 && <p className="p-12 text-center text-xs text-muted-foreground">No transcript segments match your search.</p>}
            {segments.map((s) => (
              <div key={s.id}>
                {s.handoff && (
                  <div className="flex flex-wrap items-center gap-2 border-y border-white/[0.08] bg-secondary/50 px-5 py-3 text-[10px] text-secondary-foreground">
                    <ArrowRightLeft className="size-3" />
                    <span className="font-medium">Human specialist joined</span>
                    <span className="opacity-70">· Complete context transferred</span>
                    <span className="ml-auto font-mono">{s.timestamp}</span>
                  </div>
                )}
                <div className="transcript-row">
                  <span className="pt-1 font-mono text-[10px] text-muted-foreground">{s.timestamp}</span>
                  <div className="min-w-0">
                    <div className="mb-2.5 flex flex-wrap items-center gap-2">
                      <span className={cn("flex size-5 items-center justify-center rounded-md", s.speaker === "Customer" ? "bg-white/[0.06] text-muted-foreground" : "bg-gradient-to-br from-sky-400 to-indigo-500 text-white")}>
                        {s.speaker === "ResolveAI" ? <Sparkles className="size-2.5" /> : s.speaker === "Human Agent" ? <Headphones className="size-2.5" /> : <UserRound className="size-2.5" />}
                      </span>
                      <span className="text-[11px] font-medium">{s.name}</span>
                      <span className="text-[9px] text-muted-foreground">{s.speaker === "ResolveAI" ? "AI assistant" : s.speaker === "Human Agent" ? "Payments specialist" : "Customer"}</span>
                    </div>
                    <p className="break-words text-xs leading-[1.9] text-muted-foreground">{s.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <div className="border-t border-white/[0.07] bg-white/[0.02] px-5 py-3 text-[9px] text-muted-foreground">Scripted transcript preview · Not transcribed from an actual recording</div>
    </section>
  );
}
