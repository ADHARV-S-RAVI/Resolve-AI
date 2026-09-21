import { useEffect, useRef, useState } from "react";
import { Check, CheckCircle2, ClipboardList, LoaderCircle, Sparkles } from "lucide-react";
import type { CallSession } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/lib/demo/store";

function SummarySection({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="eyebrow mb-2">{label}</p>
      <p className="text-[11px] leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}

export default function CallSummary({ call }: { call: CallSession }) {
  const { report } = useDemo();
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function generate() {
    setLoading(true);
    timer.current = setTimeout(() => {
      report(call.id, "summary");
      setLoading(false);
    }, 700);
  }

  return (
    <section className="panel overflow-hidden">
      <div className="flex items-center gap-2 border-b border-white/[0.07] bg-white/[0.02] p-5">
        <Sparkles className="size-4 text-primary" />
        <h2 className="display text-sm font-semibold">The call, at a glance</h2>
      </div>

      <div className="space-y-5 p-5">
        <div className="flex items-center justify-between">
          <span className="eyebrow">AI summary preview</span>
          <span className="text-[9px] tracking-wider text-primary">SAMPLE</span>
        </div>

        <Button variant="outline" className="w-full text-xs" onClick={generate} disabled={loading || !call.transcriptReady || call.status === "Unavailable"}>
          {loading ? <LoaderCircle className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
          {loading ? "Preparing sample…" : call.summaryReady ? "Regenerate summary preview" : "Generate AI summary"}
        </Button>

        {!call.transcriptReady && <p className="text-xs leading-6 text-muted-foreground">Generate the sample transcript first. The summary will use the same call context.</p>}

        <div aria-live="polite">
          {call.summaryReady && !loading ? (
            <div className="space-y-5">
              <SummarySection label="Customer’s concern" text={call.summary.issue} />
              <SummarySection label="What we found" text={call.summary.findings} />
              <div>
                <p className="eyebrow mb-3">Actions taken</p>
                <ul className="space-y-3">
                  {call.summary.actions.map((t) => (
                    <li className="flex items-start gap-2 text-[11px] leading-6 text-muted-foreground" key={t}>
                      <Check className="mt-1.5 size-3 shrink-0 text-primary" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-status-investigating/20 bg-status-investigating/[0.07] p-3">
                <p className="flex items-center gap-1.5 text-[11px] font-medium text-status-investigating"><CheckCircle2 className="size-3.5" />Call outcome</p>
                <p className="mt-2 text-[11px] leading-6">{call.summary.outcome}</p>
              </div>
              <div>
                <p className="eyebrow mb-3 flex items-center gap-2"><ClipboardList className="size-3" />Next steps</p>
                {call.summary.followups.map((s, i) => (
                  <div className="mb-3 flex gap-2 text-[11px] leading-6 text-muted-foreground" key={s}>
                    <span className="mt-1 flex size-4 shrink-0 items-center justify-center rounded-full bg-white/[0.07] text-[9px]">{i + 1}</span>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs leading-6 text-muted-foreground">
              {loading ? "Preparing a scripted summary preview, not generating a live AI response." : "The summary will bring together the issue, findings, actions, and next steps."}
            </p>
          )}
        </div>
      </div>

      <p className="border-t border-white/[0.07] px-5 py-3 text-[9px] leading-5 text-muted-foreground">Review before sharing. Sample summaries are not real AI analysis.</p>
    </section>
  );
}
