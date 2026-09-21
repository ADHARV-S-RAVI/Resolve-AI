import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowUpRight, GitBranch } from "lucide-react";

const data = [
  { name: "Payments", cases: 24 },
  { name: "Delivery", cases: 18 },
  { name: "Refunds", cases: 14 },
  { name: "Account", cases: 9 },
  { name: "Other", cases: 5 },
];

export default function AnalyticsPanel() {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-xs text-muted-foreground">
        Illustrative sample metrics — not live analytics or measured AI performance.
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["AI resolution rate", "68%", "Of the sample dataset"],
          ["Human escalation rate", "24%", "Cases needing a specialist"],
          ["Average resolution", "4m 32s", "Sample handling time"],
        ].map(([label, value, detail]) => (
          <div key={label} className="panel p-6">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="display mt-4 text-3xl font-semibold tracking-tight">{value}</p>
            <p className="mt-2 text-[10px] text-muted-foreground">{detail}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <section className="panel p-6">
          <h2 className="display text-sm font-semibold">Root cause distribution</h2>
          <p className="mt-1 text-xs text-muted-foreground">What brings customers to support · Sample data</p>
          <div className="mt-6 h-[260px]" role="img" aria-label="Sample cases: payments 24, delivery 18, refunds 14, account 9, other 5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ left: -25 }}>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "hsl(var(--muted)/0.4)" }} contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="cases" fill="hsl(var(--primary))" radius={[5, 5, 0, 0]} barSize={35} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="panel p-6">
          <div className="flex items-center gap-2"><GitBranch className="size-4 text-primary" /><h2 className="display text-sm font-semibold">Patterns worth a closer look</h2></div>
          <p className="mt-2 text-xs text-muted-foreground">Emerging issues in the illustrative dataset</p>
          {[
            ["Duplicate payment reports", "Payment gateway · 8 related cases"],
            ["Refund delays after cancellation", "Refund processing · 5 related cases"],
            ["Delivery confirmation mismatch", "Logistics · 4 related cases"],
          ].map(([title, detail]) => (
            <div className="mt-5 flex items-center gap-3 border-t border-white/[0.07] pt-5" key={title}>
              <div className="flex-1"><p className="text-xs font-medium">{title}</p><p className="mt-2 text-[10px] text-muted-foreground">{detail}</p></div>
              <ArrowUpRight className="size-4 text-status-investigating" />
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
