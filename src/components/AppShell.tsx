import { useState, type ReactNode } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { ArrowUpRight, ChartNoAxesCombined, CircleHelp, Home, Inbox, LayoutDashboard, Menu, MessageSquare, Phone, RotateCcw, ShieldCheck, Ticket, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDemo } from "@/lib/demo/store";
import { cn } from "@/lib/utils";

const DISPLAY = { fontFamily: '"Space Grotesk", system-ui, sans-serif' };

export default function AppShell({ children, agent = false, title = "Overview" }: { children: ReactNode; agent?: boolean; title?: string }) {
  const [open, setOpen] = useState(false);
  const [help, setHelp] = useState(false);
  const location = useLocation();
  const [params] = useSearchParams();
  const { reset } = useDemo();
  const tab = params.get("tab") || "overview";

  const links = agent
    ? [
        { label: "Overview", to: "/agent", icon: LayoutDashboard, active: location.pathname === "/agent" && tab === "overview" },
        { label: "Support inbox", to: "/agent?tab=inbox", icon: Inbox, active: tab === "inbox" || location.pathname.includes("/ticket/") },
        { label: "Calls & transcripts", to: "/agent?tab=calls", icon: Phone, active: tab === "calls" || location.pathname.includes("/calls/") },
        { label: "Analytics", to: "/agent?tab=analytics", icon: ChartNoAxesCombined, active: tab === "analytics" },
      ]
    : [
        { label: "Dashboard", to: "/support", icon: Home, active: location.pathname === "/support" && tab === "overview" },
        { label: "Conversations", to: "/chat", icon: MessageSquare, active: location.pathname === "/chat" },
        { label: "My tickets", to: "/support?tab=tickets", icon: Ticket, active: tab === "tickets" || location.pathname.startsWith("/tickets") },
      ];

  return (
    <div className="min-h-screen bg-background">
      {open && <button className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation" />}

      <aside className={cn("fixed inset-y-0 left-0 z-40 flex w-[232px] flex-col border-r border-white/[0.07] bg-card transition-transform lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex h-[72px] items-center justify-between px-6">
          <Link to="/" style={DISPLAY} className="text-lg font-semibold tracking-tight text-white">
            Resolve<span className="text-sky-400">AI</span>
          </Link>
          <button className="p-3 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X className="size-4" /></button>
        </div>

        <p className="eyebrow mb-3 px-6">{agent ? "Workspace" : "Your space"}</p>
        <nav className="space-y-1 px-4">
          {links.map((l) => (
            <Link key={l.label} to={l.to} onClick={() => setOpen(false)} className={cn("nav-item", l.active && "nav-item-active")}>
              <l.icon className="size-4" />
              <span className="flex-1">{l.label}</span>
              {l.active && <span className="size-1.5 rounded-full bg-primary" />}
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-4 p-4">
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
            <ShieldCheck className="mb-3 size-5 text-primary" />
            <p className="text-xs font-medium">One case. Full context.</p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">Every conversation picks up where the last one left off.</p>
          </div>
          <button className="nav-item w-full" onClick={() => setHelp(true)}><CircleHelp className="size-4" />About this demo</button>
          <Link className="nav-item" to={agent ? "/support" : "/agent"}><ArrowUpRight className="size-4" />{agent ? "Customer dashboard" : "Agent dashboard"}</Link>
          <div className="flex items-center gap-3 border-t border-white/[0.07] pt-4">
            <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">{agent ? "SM" : "AS"}</span>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium">{agent ? "Sarah Mitchell" : "Adharv Sharma"}</p>
              <p className="truncate text-[10px] text-muted-foreground">{agent ? "Support specialist" : "Customer · C-10482"}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[232px]">
        <header className="flex h-[64px] items-center gap-3 border-b border-white/[0.07] bg-card px-4 sm:px-8">
          <button className="p-2.5 lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu className="size-5" /></button>
          <span className="text-xs text-muted-foreground">{agent ? "Agent workspace" : "Customer workspace"}</span>
          <span className="text-white/20">/</span>
          <span className="truncate text-xs font-medium">{title}</span>
        </header>

        <div className="border-b border-white/[0.07] bg-white/[0.02] px-4 py-2 text-center text-[10px] text-muted-foreground sm:px-8">
          Sandbox environment · Sample data only · No real payments or calls
        </div>

        <main className="mx-auto max-w-[1600px] p-4 pb-28 sm:p-8">{children}</main>
      </div>

      <Dialog open={help} onOpenChange={setHelp}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>A connected support experience</DialogTitle>
            <DialogDescription>
              Explore two sample investigation journeys and an AI-to-human call handoff. This frontend does not connect to real AI,
              payments, or calling services. Please don’t enter personal information.
            </DialogDescription>
          </DialogHeader>
          <Button variant="outline" onClick={() => { reset(); setHelp(false); }}>
            <RotateCcw className="size-4" />
            Reset demo data
          </Button>
          <p className="text-xs text-muted-foreground">Reset removes your demo changes and restores the sample cases.</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
