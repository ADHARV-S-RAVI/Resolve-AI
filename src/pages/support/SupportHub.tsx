import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, ArrowUpRight, AudioLines, CheckCircle2, Clock3, MessageSquare, ShieldCheck, ShoppingBag, Ticket } from "lucide-react";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import TicketList from "@/components/support/TicketList";
import VoiceWidget from "@/components/voice/VoiceWidget";
import PhoneSupport from "@/components/support/PhoneSupport";
import { useDemo } from "@/lib/demo/store";
import { CUSTOMER_ORDERS, DEMO_CUSTOMER_NAME, formatINR } from "@/lib/demo/businessData";

export default function SupportHub() {
  const { state } = useDemo();
  const [params] = useSearchParams();
  const onlyTickets = params.get("tab") === "tickets";
  const tickets = state.tickets.filter((t) => t.customerId === "C-10482");
  const active = tickets.find((t) => t.status !== "Resolved");

  return (
    <AppShell title={onlyTickets ? "My tickets" : "Dashboard"}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Your support, all together</p>
          <h1 className="page-title mt-3">{onlyTickets ? "Your requests." : "Good morning, Adharv."}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{onlyTickets ? "Every conversation. Every update. One place." : "A little clarity goes a long way. How can we help today?"}</p>
        </div>
        <Button asChild><Link to="/chat"><MessageSquare className="size-4" />New conversation</Link></Button>
      </div>

      {!onlyTickets && (
        <>
          <section className="relative mt-8 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#070b16] p-6 sm:p-9">
            <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(70% 90% at 15% 0%, rgba(56,132,255,0.22), transparent 70%)" }} />
            <div className="relative z-10 max-w-md">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] text-white/70">
                <AudioLines className="size-3 text-sky-300" />More understanding. Less explaining.
              </div>
              <h2 className="display text-3xl font-semibold leading-tight tracking-tight">Let’s get you<br />to the other side of this.</h2>
              <p className="mt-4 max-w-sm text-xs leading-6 text-muted-foreground">Tell us what happened. We’ll investigate the details and bring in the right person if you need a little extra help.</p>
              <Button asChild className="mt-6"><Link to="/chat">Start a conversation<ArrowRight className="size-4" /></Link></Button>
            </div>
          </section>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              { icon: Ticket, label: "Open requests", value: tickets.filter((t) => t.status !== "Resolved").length, note: "We’re on it" },
              { icon: CheckCircle2, label: "Resolved", value: tickets.filter((t) => t.status === "Resolved").length, note: "One less thing to worry about" },
              { icon: Clock3, label: "Context retained", value: "100%", note: "Across this demo’s channels" },
            ].map((s) => (
              <div className="panel p-5" key={s.label}>
                <div className="flex items-center justify-between text-xs text-muted-foreground">{s.label}<s.icon className="size-4" /></div>
                <div className="mt-4 flex items-end justify-between gap-2">
                  <span className="display text-3xl font-semibold tracking-tight">{s.value}</span>
                  <span className="pb-1 text-[10px] text-muted-foreground">{s.note}</span>
                </div>
              </div>
            ))}
          </div>

          <section className="panel mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-5">
              <div>
                <h2 className="display flex items-center gap-2 text-sm font-semibold">
                  <ShoppingBag className="size-4 text-primary" />
                  My orders
                </h2>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Pick an order and we’ll look into it — no need to remember the ID.
                </p>
              </div>
              <span className="rounded-lg bg-white/[0.05] px-2.5 py-1 text-[10px] text-muted-foreground">
                {DEMO_CUSTOMER_NAME}
              </span>
            </div>
            <div className="divide-y divide-white/[0.06]">
              {CUSTOMER_ORDERS.map((o) => (
                <Link
                  key={o.id}
                  to={`/chat?order=${o.id}`}
                  className="group flex flex-wrap items-center gap-3 px-5 py-4 transition-colors hover:bg-white/[0.03]"
                >
                  <span className="font-mono text-xs font-medium text-primary">{o.id}</span>
                  <span className="text-xs text-muted-foreground">{o.status}</span>
                  <span className="text-xs">{formatINR(o.amount)}</span>
                  {o.refundStatus && (
                    <span className="pill border-status-investigating/25 text-status-investigating">
                      Refund {o.refundStatus}
                    </span>
                  )}
                  <span className="ml-auto flex items-center gap-2 text-xs text-primary">
                    Get help
                    <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}

      <section className="panel mt-8">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-5">
          <div>
            <h2 className="display text-sm font-semibold">{onlyTickets ? "All requests" : "Recent requests"}</h2>
            <p className="mt-1 text-[11px] text-muted-foreground">We keep the details, so you don’t have to.</p>
          </div>
          {!onlyTickets && <Link to="/support?tab=tickets" className="flex items-center gap-1 text-xs text-primary">View all<ArrowUpRight className="size-3" /></Link>}
        </div>
        <TicketList tickets={tickets} />
      </section>

      {!onlyTickets && (
        <section className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="panel p-6">
            <div className="flex items-start gap-3">
              <span className="icon-box"><AudioLines className="size-4" /></span>
              <div>
                <h3 className="display text-sm font-semibold">Sometimes, it’s easier to talk.</h3>
                <p className="mt-2 text-xs leading-6 text-muted-foreground">Continue your case by voice. Your context comes with you.</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2"><VoiceWidget ticketId={active?.id} inline /><PhoneSupport ticketId={active?.id} /></div>
          </div>
          <div className="panel p-6">
            <ShieldCheck className="size-6 text-primary" />
            <h3 className="display mt-3 text-sm font-semibold">A human, when it matters.</h3>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">If your issue needs a specialist, we pass along the whole story: conversations, evidence, and what we’ve already tried.</p>
          </div>
        </section>
      )}

      <VoiceWidget ticketId={active?.id} />
    </AppShell>
  );
}
