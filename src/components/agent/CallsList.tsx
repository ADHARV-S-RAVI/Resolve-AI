import { Link } from "react-router-dom";
import { ArrowUpRight, FileText, PhoneIncoming } from "lucide-react";
import type { CallSession } from "@/lib/types";
import { customers } from "@/lib/demo/seed";

export default function CallsList({ calls }: { calls: CallSession[] }) {
  if (!calls.length) return <p className="p-10 text-center text-xs text-muted-foreground">No calls match this search.</p>;
  return (
    <div>
      {calls.map((c) => (
        <Link key={c.id} to={`/agent/calls/${c.id}`} className="flex flex-wrap items-center gap-4 border-b border-white/[0.06] p-5 transition-colors last:border-b-0 hover:bg-white/[0.03]">
          <span className="icon-box"><PhoneIncoming className="size-4" /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{customers.find((x) => x.id === c.customerId)?.name || "Customer"}</p>
            <p className="mt-1 text-[10px] text-muted-foreground">{c.ticketId} · {c.startedAt}</p>
          </div>
          <div className="text-right">
            <span className="font-mono text-xs">{c.duration}</span>
            <p className="mt-1 text-[10px] text-muted-foreground">{c.agent === "ResolveAI" ? "AI only" : "AI → Human"}</p>
          </div>
          <span className="pill hidden border-white/[0.08] text-primary sm:flex"><FileText className="size-3" />{c.transcriptReady ? "Transcript ready" : "Generate transcript"}</span>
          <ArrowUpRight className="size-4 text-muted-foreground" />
        </Link>
      ))}
    </div>
  );
}
