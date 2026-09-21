import { BadgeCheck } from "lucide-react";
import type { Resolution } from "@/lib/types";
import { formatINR } from "@/lib/demo/businessData";

export default function ResolutionCard({ resolution }: { resolution: Resolution }) {
  return (
    <div className="rounded-2xl border border-primary/25 bg-primary/[0.06] p-5">
      <div className="flex items-center gap-2">
        <BadgeCheck className="size-5 text-primary" />
        <h3 className="display text-sm font-semibold">Refund approved</h3>
      </div>

      {resolution.amount !== undefined && (
        <p className="display mt-4 text-3xl font-semibold tracking-tight">
          {formatINR(resolution.amount)}
        </p>
      )}

      <dl className="mt-4 space-y-2 text-xs">
        {resolution.refundId && (
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Refund ID</dt>
            <dd className="font-mono font-medium">{resolution.refundId}</dd>
          </div>
        )}
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">Refund status</dt>
          <dd className="capitalize">{resolution.status}</dd>
        </div>
        {resolution.currency && (
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Currency</dt>
            <dd>{resolution.currency}</dd>
          </div>
        )}
      </dl>

      <p className="mt-4 border-t border-white/[0.07] pt-3 text-[10px] text-muted-foreground">
        Sandbox environment — no real payment was processed.
      </p>
    </div>
  );
}
