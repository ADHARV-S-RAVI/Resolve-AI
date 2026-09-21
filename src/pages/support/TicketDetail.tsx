import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MessageSquare } from "lucide-react";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import TicketStatusBadge from "@/components/support/TicketStatusBadge";
import ConversationTimeline from "@/components/support/ConversationTimeline";
import Conversation from "@/components/support/Conversation";
import EscalationBanner from "@/components/support/EscalationBanner";
import ResolutionCard from "@/components/support/ResolutionCard";
import VoiceWidget from "@/components/voice/VoiceWidget";
import { useDemo } from "@/lib/demo/store";

export default function TicketDetail() {
  const { id } = useParams();
  const { state, send } = useDemo();
  const ticket = state.tickets.find((t) => t.id === id);

  return (
    <AppShell title="Ticket details">
      {!ticket ? (
        <>
          <h1 className="page-title">Ticket not found</h1>
          <Link className="mt-4 inline-flex text-primary" to="/support">Back to dashboard</Link>
        </>
      ) : (
        <>
          <Link className="mb-5 flex items-center gap-2 text-xs text-muted-foreground" to="/support?tab=tickets"><ArrowLeft className="size-3" />All your requests</Link>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="eyebrow font-mono">#{ticket.id}</p>
              <h1 className="display mt-3 max-w-2xl text-3xl font-semibold tracking-tight">{ticket.issue}</h1>
            </div>
            <Button asChild><Link to={`/chat?ticket=${ticket.id}`}><MessageSquare className="size-4" />Continue conversation</Link></Button>
          </div>
          <div className="mb-7 mt-5 flex flex-wrap items-center gap-4">
            <TicketStatusBadge status={ticket.status} />
            <span className="text-xs text-muted-foreground">{ticket.priority} priority · {ticket.category}</span>
          </div>
          {ticket.resolution && (
            <div className="mb-5 max-w-md">
              <ResolutionCard resolution={ticket.resolution} />
            </div>
          )}
          {ticket.escalation && <div className="mb-5"><EscalationBanner escalation={ticket.escalation} /></div>}
          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <section className="panel overflow-hidden">
              <h2 className="display border-b border-white/[0.07] p-5 text-sm font-semibold">Previous conversation</h2>
              <Conversation messages={ticket.messages} onSend={(text) => send(ticket.id, text)} />
            </section>
            <ConversationTimeline ticket={ticket} />
          </div>
          <VoiceWidget ticketId={ticket.id} />
        </>
      )}
    </AppShell>
  );
}
