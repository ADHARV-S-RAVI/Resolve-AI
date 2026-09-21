import { Link } from "react-router-dom";
import { ArrowUpRight, CircleCheck, Phone } from "lucide-react";
import type { Ticket } from "@/lib/types";

export default function ConversationTimeline({ ticket, agent = false }: { ticket: Ticket; agent?: boolean }) {
  return (
    <section className="panel p-5">
      <h2 className="display mb-6 text-sm font-semibold">Your case, step by step</h2>
      {ticket.events.length === 0 && <p className="text-xs text-muted-foreground">The timeline begins with your first message.</p>}
      <ol>
        {ticket.events.map((e, i) => (
          <li className="relative flex gap-3 pb-7 last:pb-0" key={e.id}>
            {i < ticket.events.length - 1 && <span className="absolute bottom-0 left-[11px] top-6 w-px bg-white/[0.1]" />}
            <span className="z-10 flex size-6 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-card text-primary">
              {e.callId ? <Phone className="size-2.5" /> : <CircleCheck className="size-3" />}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium">{e.title}</p>
              <p className="mt-1 break-words text-[11px] leading-5 text-muted-foreground">{e.detail}</p>
              <p className="mt-1 font-mono text-[9px] text-muted-foreground">{e.time}</p>
              {e.callId && agent && (
                <Link to={`/agent/calls/${e.callId}`} className="mt-2 flex items-center gap-1 text-[11px] text-primary">
                  Open call & transcript
                  <ArrowUpRight className="size-3" />
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
