import { Check, ShieldCheck } from "lucide-react";
import type { Escalation } from "@/lib/types";

export default function EscalationBanner({ escalation }: { escalation: Escalation }) {
  return (
    <div className="rounded-2xl border border-status-investigating/25 bg-status-investigating/[0.08] p-5">
      <div className="flex items-start gap-3">
        <ShieldCheck className="size-5 shrink-0 text-status-investigating" />
        <div>
          <h3 className="text-sm font-medium">A specialist can take it from here.</h3>
          <p className="mt-2 text-xs leading-6 text-muted-foreground">{escalation.reason} Your case is ready for {escalation.team}. You won’t have to repeat anything.</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            {["Full conversation", "Evidence & investigation", "Actions & next steps"].map((t) => (
              <span className="flex items-center gap-1 text-[10px] text-primary" key={t}><Check className="size-3" />{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
