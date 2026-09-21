import { useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, ShieldCheck, ShoppingBag, Sparkles } from "lucide-react";
import AppShell from "@/components/AppShell";
import Conversation from "@/components/support/Conversation";
import InvestigationPanel from "@/components/agent/InvestigationPanel";
import TicketStatusBadge from "@/components/support/TicketStatusBadge";
import EscalationBanner from "@/components/support/EscalationBanner";
import ResolutionCard from "@/components/support/ResolutionCard";
import OrderActions from "@/components/support/OrderActions";
import VoiceWidget from "@/components/voice/VoiceWidget";
import PhoneSupport from "@/components/support/PhoneSupport";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/lib/demo/store";
import { findCustomerOrder, formatINR } from "@/lib/demo/businessData";

export default function ChatPage() {
  const [params, setParams] = useSearchParams();
  const { state, createTicket, send, action } = useDemo();
  const selected = params.get("ticket");
  const ticket = state.tickets.find((t) => t.id === selected);

  const orderId = params.get("order");
  const order = findCustomerOrder(orderId);
  const orderPrefixSent = useRef(false);

  function onSend(text: string) {
    let finalText = text;
    if (order && !orderPrefixSent.current) {
      finalText = `I need help with order ${order.id}. ${text}`;
      orderPrefixSent.current = true;
    }
    const id = ticket?.id || createTicket();
    if (!ticket) {
      setParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("ticket", id);
        return next;
      });
    }
    send(id, finalText);
  }

  if (selected && !ticket) {
    return (
      <AppShell title="Conversation">
        <h1 className="page-title">Case not found</h1>
        <Link className="mt-4 inline-flex text-primary" to="/support">Back to your dashboard</Link>
      </AppShell>
    );
  }

  return (
    <AppShell title="Conversation">
      <Link to="/support" className="mb-5 flex items-center gap-2 text-xs text-muted-foreground"><ArrowLeft className="size-3" />Your dashboard</Link>

      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Let’s work through it.</h1>
          <p className="mt-2 text-xs text-muted-foreground">One conversation, all the way to resolution.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <VoiceWidget key={ticket?.id || "new"} ticketId={ticket?.id} inline />
          <PhoneSupport ticketId={ticket?.id} />
        </div>
      </div>

      {order && (
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-primary/20 bg-secondary/40 px-4 py-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
            <ShoppingBag className="size-4" />
          </span>
          <div className="min-w-0 flex-1 text-xs">
            <span className="font-mono font-semibold text-primary">{order.id}</span>
            <span className="mx-2 text-muted-foreground">·</span>
            <span className="text-muted-foreground">{order.status} · {formatINR(order.amount)}</span>
            {order.refundStatus && (
              <span className="pill ml-2 border-status-investigating/25 text-status-investigating">Refund {order.refundStatus}</span>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground">We already have this order in context</span>
        </div>
      )}

      {ticket?.escalation && <div className="mb-5"><EscalationBanner escalation={ticket.escalation} /></div>}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="panel overflow-hidden">
          <header className="flex items-center gap-3 border-b border-white/[0.07] p-5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 text-white"><Sparkles className="size-4" /></span>
            <div>
              <h2 className="display text-sm font-semibold">ResolveAI support</h2>
              <p className="mt-1 text-[10px] text-muted-foreground">Your context is right here with us</p>
            </div>
            <span className="pill ml-auto border-white/[0.08] text-muted-foreground">Sandbox</span>
          </header>
          <Conversation key={selected || "new"} messages={ticket?.messages || []} onSend={onSend} />
        </section>

        <aside className="space-y-4">
          {ticket ? (
            <>
              <div className="panel p-5">
                <p className="eyebrow">Your request</p>
                <Link to={`/tickets/${ticket.id}`} className="mt-3 flex items-center gap-2 font-mono text-sm text-primary">#{ticket.id}<ArrowUpRight className="size-3" /></Link>
                <p className="mb-4 mt-2 text-xs leading-6 text-muted-foreground">{ticket.issue}</p>
                <TicketStatusBadge status={ticket.status} />
                <Button variant="ghost" className="mt-3 w-full text-xs" onClick={() => action(ticket.id, "escalate")}>Request a human specialist</Button>
              </div>
              {ticket.resolution && (
                <ResolutionCard resolution={ticket.resolution} />
              )}
              <OrderActions orderId={orderId} />
              <InvestigationPanel ticket={ticket} />
            </>
          ) : (
            <div className="panel p-6">
              <ShieldCheck className="size-6 text-primary" />
              <h3 className="display mt-4 text-sm font-semibold">A case, not just a chat.</h3>
              <p className="mt-3 text-xs leading-6 text-muted-foreground">Your first message creates a demo complaint. Every conversation and investigation stays connected to it.</p>
            </div>
          )}
        </aside>
      </div>

      <VoiceWidget key={`float-${ticket?.id}`} ticketId={ticket?.id} />
    </AppShell>
  );
}
