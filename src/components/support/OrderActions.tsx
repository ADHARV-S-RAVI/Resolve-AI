import { useState } from "react";
import { useDemo } from "@/lib/demo/store";

type Kind = "cancel" | "return" | "exchange" | "refund";

const LABELS: Record<Kind, { idle: string; pending: string; done: string }> = {
  cancel: { idle: "Cancel order", pending: "Cancelling order…", done: "Order cancelled" },
  return: { idle: "Request return", pending: "Creating return request…", done: "Return request submitted" },
  exchange: { idle: "Request exchange", pending: "Processing exchange request…", done: "Exchange request submitted" },
  refund: { idle: "Request refund", pending: "Processing refund…", done: "Refund requested" },
};

/**
 * Real, persisted order actions. Every button awaits the Supabase write and
 * only shows success once the row actually changed — a failed write surfaces
 * an error state instead of a fake success.
 */
export default function OrderActions({ orderId }: { orderId?: string | null }) {
  const { orders, orderAction } = useDemo();
  const [pending, setPending] = useState<Kind | null>(null);
  const [done, setDone] = useState<Partial<Record<Kind, string>>>({});
  const [error, setError] = useState<string | null>(null);

  const order = orders.find(
    (o) => o.id === (orderId ?? "").toUpperCase(),
  );

  if (!order) return null;

  const available: Kind[] = [];
  if (order.cancellation_eligible) available.push("cancel");
  if (String(order.return_status).startsWith("Eligible")) available.push("return");
  if (order.exchange_eligible) available.push("exchange");
  if (order.refund_status !== "Completed") available.push("refund");

  async function run(kind: Kind) {
    setError(null);
    setPending(kind);

    const res = await orderAction(order!.id, kind);

    setPending(null);

    if (res.ok) {
      setDone((d) => ({ ...d, [kind]: LABELS[kind].done }));
    } else {
      setError(res.error ?? "The action failed. Please try again.");
    }
  }

  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="eyebrow">Actions · {order.id}</p>
        <span className="text-[10px] text-muted-foreground">
          Sandbox — no real transactions
        </span>
      </div>

      <p className="mt-2 text-[11px] text-muted-foreground">
        {order.product} · {order.status} · ₹{Number(order.amount).toLocaleString("en-IN")}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {available.length === 0 && (
          <p className="text-xs text-muted-foreground">
            No actions are available for this order state.
          </p>
        )}

        {available.map((kind) => (
          <button
            key={kind}
            disabled={pending !== null || Boolean(done[kind])}
            onClick={() => run(kind)}
            className="min-h-11 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 text-xs transition-colors hover:bg-white/[0.08] disabled:opacity-60"
          >
            {done[kind] ??
              (pending === kind ? LABELS[kind].pending : LABELS[kind].idle)}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-3 text-[11px] text-status-escalated">{error}</p>
      )}
    </div>
  );
}
