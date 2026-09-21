import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, ChevronRight } from "lucide-react";
import AppShell from "@/components/AppShell";
import Customer360 from "@/components/agent/Customer360";
import InvestigationPanel from "@/components/agent/InvestigationPanel";
import Conversation from "@/components/support/Conversation";
import ConversationTimeline from "@/components/support/ConversationTimeline";
import TicketStatusBadge from "@/components/support/TicketStatusBadge";
import EscalationBanner from "@/components/support/EscalationBanner";
import { useDemo } from "@/lib/demo/store";
import { cn } from "@/lib/utils";

const TABS = ["Customer", "Conversation", "Investigation"];

export default function AgentTicket() {
  const { id } = useParams();
  const { state, send } = useDemo();
  const ticket = state.tickets.find((t) => t.id === id);
  const [tab, setTab] = useState("Conversation");

  if (!ticket) {
    return (
      <AppShell agent title="Ticket workspace">
        <h1 className="page-title">Ticket not found</h1>
        <Link to="/agent?tab=inbox" className="mt-5 inline-flex text-primary">Back to inbox</Link>
      </AppShell>
    );
  }

  const steps = ["Received", "Understood", "Ticketed", "Investigating", "Decision", ticket.status === "Escalated" ? "Escalated" : "Resolved"];

  return (
    <AppShell agent title="Ticket workspace">
      <Link to="/agent?tab=inbox" className="mb-5 flex items-center gap-2 text-xs text-muted-foreground"><ArrowLeft className="size-3" />Support inbox</Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] text-muted-foreground">#{ticket.id} <span className="mx-2">/</span> {ticket.category}</p>
          <h1 className="display mt-3 text-2xl font-semibold tracking-tight">{ticket.issue}</h1>
        </div>
        <TicketStatusBadge status={ticket.status} />
      </div>

      <div className="my-6 flex flex-wrap items-center gap-2 rounded-2xl border border-white/[0.08] bg-card p-3">
        {steps.map((s, i) => (
          <span key={s} className="flex items-center gap-2 text-[9px] text-muted-foreground">
            <span className={cn("flex items-center gap-1 rounded-lg px-2 py-1", (i < 4 || ticket.status === s) && "bg-secondary text-secondary-foreground")}>
              {i < 3 && <Check className="size-2.5" />}{s}
            </span>
            {i < steps.length - 1 && <ChevronRight className="size-2.5" />}
          </span>
        ))}
        <span className="ml-auto hidden text-[9px] text-muted-foreground 2xl:block">Enterprise workflow orchestration</span>
      </div>

      {ticket.escalation && <div className="mb-5"><EscalationBanner escalation={ticket.escalation} /></div>}

      <div className="mb-4 flex gap-2 xl:hidden" role="tablist" aria-label="Workspace panels">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={cn("min-h-11 rounded-xl border border-white/[0.08] px-3 text-xs", tab === t ? "bg-primary text-primary-foreground" : "bg-card")} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[220px_minmax(0,1fr)_290px] 2xl:grid-cols-[250px_minmax(0,1fr)_320px]">
        <div className={cn(tab !== "Customer" && "hidden xl:block")}><Customer360 ticket={ticket} /></div>
        <div className={cn("space-y-4", tab !== "Conversation" && "hidden xl:block")}>
          <section className="panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/[0.07] p-5">
              <h2 className="display text-sm font-semibold">Conversation</h2>
              <span className="text-[10px] text-muted-foreground">All channels · Full context</span>
            </div>
            <Conversation agent messages={ticket.messages} onSend={(text) => send(ticket.id, text, true)} />
          </section>
          <ConversationTimeline ticket={ticket} agent />
        </div>
        <div className={cn(tab !== "Investigation" && "hidden xl:block")}><InvestigationPanel ticket={ticket} controls /></div>
      </div>
    </AppShell>
  );
}
