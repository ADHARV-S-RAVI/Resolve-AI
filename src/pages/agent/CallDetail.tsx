import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, AudioLines, CalendarDays, Check, Clock3, Headphones, PhoneIncoming, ShieldCheck, UserRound } from "lucide-react";
import AppShell from "@/components/AppShell";
import CallTranscript from "@/components/agent/CallTranscript";
import CallSummary from "@/components/agent/CallSummary";
import ShareCallDialog from "@/components/agent/ShareCallDialog";
import { useDemo } from "@/lib/demo/store";
import { customers } from "@/lib/demo/seed";

export default function CallDetail() {
  const { callId } = useParams();
  const { state } = useDemo();
  const call = state.calls.find((c) => c.id === callId);
  const customer = customers.find((c) => c.id === call?.customerId);

  if (!call) {
    return (
      <AppShell agent title="Call workspace">
        <h1 className="page-title">Call not found</h1>
        <Link to="/agent?tab=calls" className="mt-4 inline-flex text-primary">Back to calls</Link>
      </AppShell>
    );
  }

  const meta = [
    { icon: UserRound, label: "CUSTOMER", value: customer?.name || "Demo customer", note: call.customerId },
    { icon: CalendarDays, label: "STARTED", value: call.startedAt, note: `Ended ${call.endedAt}` },
    { icon: Clock3, label: "DURATION", value: call.duration, note: "Sample call duration" },
    { icon: Headphones, label: "HANDLED BY", value: call.agent, note: call.team },
  ];

  return (
    <AppShell agent title="Call workspace">
      <Link to="/agent?tab=calls" className="mb-6 flex items-center gap-2 text-xs text-muted-foreground"><ArrowLeft className="size-3" />Calls & transcripts</Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">A conversation, connected.</p>
          <h1 className="page-title mt-3">Call with {customer?.name.split(" ")[0] || "customer"}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono text-[10px]">{call.id}</span>
            <span>·</span>
            <span>{call.channel === "phone" ? "Incoming phone call" : "Web voice call"}</span>
            <span className="pill status-resolved"><Check className="size-3" />{call.status}</span>
          </div>
        </div>
        <ShareCallDialog call={call} />
      </div>

      <section className="panel mb-6 mt-7 overflow-hidden">
        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-4">
          {meta.map((m) => (
            <div className="flex items-start gap-3" key={m.label}>
              <m.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-[9px] font-medium tracking-wider text-muted-foreground">{m.label}</p>
                <p className="mt-2 text-xs font-medium">{m.value}</p>
                <p className="mt-1.5 text-[10px] text-muted-foreground">{m.note}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] bg-white/[0.02] px-5 py-3">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground"><PhoneIncoming className="size-3" /><span>Linked to the same complaint</span></div>
          <Link className="flex items-center gap-2 font-mono text-[11px] font-medium text-primary" to={`/agent/ticket/${call.ticketId}`}>#{call.ticketId}<ArrowUpRight className="size-3" /></Link>
        </div>
      </section>

      <section className="mb-6 flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 sm:flex-row sm:items-center">
        <div className="flex shrink-0 items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-full border border-white/[0.1] bg-card text-primary"><AudioLines className="size-4" /></span>
          <ArrowRight className="size-3 text-muted-foreground" />
          <span className="flex size-9 items-center justify-center rounded-full border border-white/[0.1] bg-card text-primary"><Headphones className="size-4" /></span>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="display text-xs font-semibold">{call.agent === "ResolveAI" ? "AI conversation · Handoff recommended" : "AI to human. Nothing lost in between."}</h2>
          <p className="mt-1.5 text-[11px] leading-5 text-muted-foreground">{call.reason}</p>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 text-[10px] font-medium text-primary"><ShieldCheck className="size-3.5" />Full context preserved</span>
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <CallTranscript key={`transcript-${call.id}`} call={call} />
        <CallSummary key={`summary-${call.id}`} call={call} />
      </div>
    </AppShell>
  );
}
