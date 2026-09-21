import { BadgeCheck, Check, FileSearch, ShieldCheck, Sparkles } from "lucide-react";
import type { Ticket } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/demo/businessData";
import { useDemo } from "@/lib/demo/store";

export default function InvestigationPanel({ ticket, controls = false }: { ticket: Ticket; controls?: boolean }) {
  const { action } = useDemo();
  const inv = ticket.investigation;
  // Prototype refund flow: the agent can approve a refund for any open ticket
  // that does not already have a resolution — no return/inspection prerequisite.
  const canApprove = ticket.status !== "Resolved" && !ticket.resolution;

  return (
    <section className="panel overflow-hidden">
      <div className="flex items-center gap-2 border-b border-white/[0.07] p-5">
        <Sparkles className="size-4 text-primary" />
        <h2 className="display text-sm font-semibold">AI investigation</h2>
        <span className="ml-auto text-[9px] tracking-wider text-muted-foreground">SANDBOX</span>
      </div>

      <div className="space-y-6 p-5">
        <div>
          <p className="eyebrow mb-3">Investigation trail</p>
          {inv.steps.length ? (
            <div className="space-y-3">
              {inv.steps.map((s) => (
                <div className="flex items-center gap-2 text-[11px]" key={s}>
                  <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground"><Check className="size-2.5" /></span>
                  {s}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs leading-6 text-muted-foreground">
              {inv.stage === "Waiting for customer" ? "Waiting for your transaction ID to continue." : "Evidence checks begin after the complaint details are provided."}
            </p>
          )}
        </div>

        {inv.rootCause && (
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
            <p className="flex items-center gap-2 text-xs font-medium text-primary"><FileSearch className="size-3.5" />Root-cause hypothesis</p>
            <p className="mt-3 text-xs leading-6 text-white/80">{inv.rootCause}</p>
            <div className="mt-4 border-t border-white/[0.07] pt-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">Sample confidence</span>
                <span className="font-mono text-lg font-semibold text-primary">{inv.confidence}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
                <div className="h-full rounded-full bg-gradient-to-r from-teal-300 via-sky-400 to-indigo-400" style={{ width: `${inv.confidence}%` }} />
              </div>
            </div>
          </div>
        )}

        {inv.evidence.length > 0 && (
          <div>
            <p className="eyebrow mb-3">Supporting evidence</p>
            <div className="space-y-2">
              {inv.evidence.map((e) => (
                <div key={e.reference} className="rounded-xl border border-white/[0.07] p-3">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">{e.source}</span>
                    <span className="font-mono text-white/70">{e.reference}</span>
                  </div>
                  <p className="mt-1.5 text-[11px] font-medium">{e.result}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="eyebrow mb-2">Qwen reasoning preview</p>
          <p className="text-sm font-medium">{inv.decision}</p>
          <p className="mt-2 text-[10px] leading-5 text-muted-foreground">Sandbox analysis. Recommendations are not executed actions.</p>
        </div>

        {controls && (
          <div className="space-y-2 border-t border-white/[0.07] pt-4">
            {ticket.resolution && (
              <div className="mb-2 rounded-xl border border-primary/20 bg-secondary/40 p-4">
                <p className="flex items-center gap-2 text-xs font-medium text-primary">
                  <BadgeCheck className="size-4" />
                  Refund approved
                </p>
                {ticket.resolution.amount !== undefined && (
                  <p className="display mt-2 text-xl font-semibold">
                    {formatINR(ticket.resolution.amount)}
                  </p>
                )}
                <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
                  {ticket.resolution.refundId && (
                    <>
                      Refund ID: <span className="font-mono">{ticket.resolution.refundId}</span>
                      <br />
                    </>
                  )}
                  Status:{" "}
                  <span className="capitalize">
                    {ticket.resolution.status}
                  </span>
                </p>
                <p className="mt-2 text-[9px] text-muted-foreground">
                  Sandbox — no real payment was processed.
                </p>
              </div>
            )}
            <Button className="w-full" onClick={() => action(ticket.id, "approve")} disabled={!canApprove}>
              <ShieldCheck className="size-4" />
              {ticket.status === "Resolved" ? "Resolved" : "Approve refund"}
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => action(ticket.id, "review")}>Review</Button>
              <Button variant="outline" onClick={() => action(ticket.id, "escalate")}>Escalate</Button>
            </div>
            <p className="text-center text-[9px] text-muted-foreground">Sandbox — no real payments are processed.</p>
          </div>
        )}
      </div>
    </section>
  );
}
