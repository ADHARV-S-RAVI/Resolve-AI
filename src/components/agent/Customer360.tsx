import { Link } from "react-router-dom";
import { ArrowUpRight, Mail, Package, ShieldCheck } from "lucide-react";
import { customers } from "@/lib/demo/seed";
import type { Ticket } from "@/lib/types";
import { useDemo } from "@/lib/demo/store";

export default function Customer360({ ticket }: { ticket: Ticket }) {
  const customer = customers.find((c) => c.id === ticket.customerId);
  const { state } = useDemo();
  const others = state.tickets.filter((t) => t.customerId === ticket.customerId && t.id !== ticket.id);

  return (
    <section className="panel p-5">
      <p className="eyebrow">Customer 360</p>
      <div className="mt-5 flex size-14 items-center justify-center rounded-full bg-secondary text-lg font-semibold text-secondary-foreground">{customer?.initials}</div>
      <h2 className="display mt-4 text-base font-semibold">{customer?.name}</h2>
      <p className="mt-1 font-mono text-[10px] text-muted-foreground">{ticket.customerId}</p>
      <p className="mt-4 flex items-center gap-2 break-all text-[11px] text-muted-foreground"><Mail className="size-3 shrink-0" />{customer?.email}</p>
      <p className="mt-3 flex items-center gap-2 text-[11px] text-primary"><ShieldCheck className="size-3" />{customer?.accountStatus}</p>

      <div className="mt-6 space-y-4 border-t border-white/[0.07] pt-5">
        <div>
          <p className="eyebrow mb-2">Assigned specialist</p>
          <p className="text-xs">{ticket.assignee}</p>
        </div>
        <div>
          <p className="eyebrow mb-2">Related order</p>
          <p className="flex items-center gap-2 text-xs"><Package className="size-3.5" />ORD-4821</p>
          <p className="mt-1 text-[10px] text-muted-foreground">Sample order · Cancelled</p>
        </div>
        <div>
          <p className="eyebrow mb-3">Other requests</p>
          {others.length === 0 && <p className="text-[11px] text-muted-foreground">No other cases for this customer.</p>}
          {others.map((t) => (
            <Link to={`/agent/ticket/${t.id}`} className="mb-3 flex items-center gap-2 font-mono text-[11px] text-primary" key={t.id}>{t.id}<ArrowUpRight className="size-3" /></Link>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
        <p className="text-[10px] font-medium text-primary">Context summary · Demo</p>
        <p className="mt-2 text-[11px] leading-6 text-muted-foreground">This customer’s case includes {ticket.messages.length} messages across connected channels. Review the latest evidence before taking action.</p>
      </div>
    </section>
  );
}
