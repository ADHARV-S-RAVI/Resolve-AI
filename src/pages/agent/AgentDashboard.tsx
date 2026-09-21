import { lazy, Suspense, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, ArrowUpRight, CheckCircle2, Headphones, Inbox, Phone, Search, ShieldCheck, Ticket } from "lucide-react";
import AppShell from "@/components/AppShell";
import TicketList from "@/components/support/TicketList";
import CallsList from "@/components/agent/CallsList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDemo } from "@/lib/demo/store";
import { customers } from "@/lib/demo/seed";

const AnalyticsPanel = lazy(() => import("@/components/agent/AnalyticsPanel"));

export default function AgentDashboard() {
  const { state } = useDemo();
  const [params] = useSearchParams();
  const tab = params.get("tab") || "overview";
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [priority, setPriority] = useState("All priorities");

  const title = tab === "inbox" ? "Support inbox" : tab === "calls" ? "Calls & transcripts" : tab === "analytics" ? "The bigger picture." : "Good morning, Sarah.";

  const tickets = state.tickets.filter(
    (t) =>
      `${t.id} ${t.issue} ${customers.find((c) => c.id === t.customerId)?.name}`.toLowerCase().includes(search.toLowerCase()) &&
      (status === "All statuses" || t.status === status) &&
      (priority === "All priorities" || t.priority === priority),
  );

  const calls = state.calls.filter((c) => `${c.id} ${c.ticketId} ${customers.find((x) => x.id === c.customerId)?.name}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <AppShell agent title={tab === "overview" ? "Overview" : title}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{tab === "calls" ? "Every word. All the context." : "Support, with a clearer picture"}</p>
          <h1 className="page-title mt-3">{title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {tab === "calls" ? "From AI conversation to human resolution. Keep the whole story." : tab === "analytics" ? "Understand the patterns behind your support." : "Here’s what needs your attention. We’ve gathered the context."}
          </p>
        </div>
        <span className="rounded-xl border border-white/[0.08] bg-card px-3 py-2 text-[11px] text-muted-foreground">Sample workspace · September 17, 2026</span>
      </div>

      {tab === "analytics" ? (
        <Suspense fallback={<div className="panel p-10 text-sm text-muted-foreground">Loading sample analytics…</div>}>
          <AnalyticsPanel />
        </Suspense>
      ) : (
        <>
          {tab === "overview" && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Open tickets", value: state.tickets.filter((t) => t.status !== "Resolved").length, icon: Ticket, detail: "Across all channels" },
                  { label: "Needs a human", value: state.tickets.filter((t) => t.status === "Escalated").length, icon: Headphones, detail: "Context ready for handoff" },
                  { label: "Resolved", value: state.tickets.filter((t) => t.status === "Resolved").length, icon: CheckCircle2, detail: "In this demo workspace" },
                  { label: "Call conversations", value: state.calls.length, icon: Phone, detail: "Transcripts in one place" },
                ].map((m) => (
                  <div className="panel p-5" key={m.label}>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">{m.label}<m.icon className="size-4" /></div>
                    <p className="display mt-5 text-3xl font-semibold tracking-tight">{String(m.value).padStart(2, "0")}</p>
                    <p className="mt-2 text-[10px] text-muted-foreground">{m.detail}</p>
                  </div>
                ))}
              </div>

              <div className="mb-7 mt-5 flex flex-wrap items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
                <ShieldCheck className="size-6 text-primary" />
                <div className="flex-1">
                  <p className="text-xs font-medium">The handoff is ready. The story stays intact.</p>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">Review the customer’s call, AI investigation, and next steps before you jump in.</p>
                </div>
                <Link to="/agent/calls/CALL-2084" className="flex items-center gap-2 text-xs font-medium text-primary">Review call<ArrowRight className="size-3.5" /></Link>
              </div>
            </>
          )}

          <section className="panel">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] p-5">
              <div>
                <h2 className="display flex items-center gap-2 text-sm font-semibold">
                  {tab === "calls" ? <Phone className="size-4" /> : <Inbox className="size-4" />}
                  {tab === "calls" ? "Call history" : "Support inbox"}
                  <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{tab === "calls" ? calls.length : tickets.length}</span>
                </h2>
                <p className="mt-1.5 text-[11px] text-muted-foreground">{tab === "calls" ? "Review transcripts, summaries, and handoffs." : "Every case has a story. Pick up right where it left off."}</p>
              </div>
              <div className="relative w-full sm:w-[230px]">
                <Search className="absolute left-3 top-3.5 size-3.5 text-muted-foreground" />
                <Input aria-label="Search tickets or calls" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={tab === "calls" ? "Search calls…" : "Search tickets…"} className="h-10 pl-9 text-xs" />
              </div>
            </div>

            {tab !== "calls" && (
              <div className="flex flex-wrap gap-2 border-b border-white/[0.07] px-5 py-3">
                <select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-lg border border-white/[0.1] bg-card px-3 text-xs text-muted-foreground">
                  {["All statuses", "Investigating", "In Progress", "Resolved", "Escalated"].map((o) => <option key={o}>{o}</option>)}
                </select>
                <select aria-label="Filter by priority" value={priority} onChange={(e) => setPriority(e.target.value)} className="h-10 rounded-lg border border-white/[0.1] bg-card px-3 text-xs text-muted-foreground">
                  {["All priorities", "High", "Medium", "Low"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            )}

            {tab === "calls" ? <CallsList calls={calls} /> : <TicketList tickets={tickets} agent />}
          </section>

          {tab === "overview" && (
            <section className="panel mt-6">
              <div className="flex items-center justify-between border-b border-white/[0.07] p-5">
                <div>
                  <h2 className="display text-sm font-semibold">Recent call activity</h2>
                  <p className="mt-1 text-[11px] text-muted-foreground">The call ends. The context doesn’t.</p>
                </div>
                <Button asChild variant="ghost" size="sm"><Link to="/agent?tab=calls">View calls<ArrowUpRight className="size-3" /></Link></Button>
              </div>
              <CallsList calls={state.calls.slice(0, 3)} />
            </section>
          )}
        </>
      )}
    </AppShell>
  );
}
