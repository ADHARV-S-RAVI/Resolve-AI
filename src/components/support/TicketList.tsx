import { Link } from "react-router-dom";
import { ArrowUpRight, MessageSquare, Phone } from "lucide-react";
import type { Ticket } from "@/lib/types";
import { customers } from "@/lib/demo/seed";
import TicketStatusBadge from "./TicketStatusBadge";

export default function TicketList({ tickets, agent = false }: { tickets: Ticket[]; agent?: boolean }) {
  if (!tickets.length) return <div className="p-10 text-center text-sm text-muted-foreground">No tickets match these filters.</div>;

  return (
    <div>
      <div className={`hidden grid-cols-12 gap-3 border-b border-white/[0.07] bg-white/[0.02] px-5 py-3 text-[10px] font-medium tracking-wider text-muted-foreground ${agent ? "xl:grid" : "md:grid"}`}>
        <span className={agent ? "col-span-5" : "col-span-6"}>TICKET / ISSUE</span>
        {agent && <span className="col-span-2">CUSTOMER</span>}
        <span className="col-span-2">STATUS</span>
        <span className="col-span-2">{agent ? "PRIORITY" : "UPDATED"}</span>
        <span className={agent ? "col-span-1" : "col-span-2"}>{agent ? "AI" : "CHANNEL"}</span>
      </div>

      {tickets.map((t) => (
        <Link
          key={t.id}
          to={agent ? `/agent/ticket/${t.id}` : `/tickets/${t.id}`}
          className={`group grid grid-cols-1 gap-3 border-b border-white/[0.06] px-5 py-5 transition-colors last:border-b-0 hover:bg-white/[0.03] ${agent ? "xl:grid-cols-12 xl:items-center" : "md:grid-cols-12 md:items-center"}`}
        >
          <div className={`min-w-0 ${agent ? "xl:col-span-5" : "md:col-span-6"}`}>
            <span className="font-mono text-[10px] text-muted-foreground">#{t.id}</span>
            <p className="mt-1.5 flex items-start gap-2 text-[13px] font-medium transition-colors group-hover:text-primary">
              {t.issue}
              <ArrowUpRight className="mt-0.5 size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
            </p>
          </div>
          {agent && <span className="text-xs text-muted-foreground xl:col-span-2">{customers.find((c) => c.id === t.customerId)?.name}</span>}
          <span className={agent ? "xl:col-span-2" : "md:col-span-2"}><TicketStatusBadge status={t.status} /></span>
          <span className={`text-xs ${agent ? "xl:col-span-2" : "md:col-span-2"}`}>
            {agent ? (
              <span className={t.priority === "High" ? "text-status-escalated" : "text-muted-foreground"}>{t.priority === "High" ? "↑ " : "− "}{t.priority}</span>
            ) : (
              <span className="text-muted-foreground">{t.updated}</span>
            )}
          </span>
          <span className={`flex items-center gap-1.5 text-xs text-muted-foreground ${agent ? "xl:col-span-1" : "md:col-span-2"}`}>
            {agent ? (
              <span className="font-mono">{t.investigation.confidence ? `${t.investigation.confidence}%` : "—"}</span>
            ) : (
              <>
                {t.channel === "chat" ? <MessageSquare className="size-3" /> : <Phone className="size-3" />}
                <span className="capitalize">{t.channel}</span>
              </>
            )}
          </span>
        </Link>
      ))}
    </div>
  );
}
