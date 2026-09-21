import { ArrowRight, Headphones, MessageSquare, Mic, Paperclip, Phone, Plus, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const DISPLAY = { fontFamily: '"Space Grotesk", system-ui, sans-serif' };

const CHANNELS = [
  { icon: MessageSquare, label: "Web chat" },
  { icon: Mic, label: "Web voice" },
  { icon: Phone, label: "Phone" },
  { icon: Headphones, label: "Human agent" },
];

export const Hero = () => {
  return (
    <div className="relative px-6 pb-24 pt-6 text-center md:px-10 md:text-left">
      <div className="relative mx-auto max-w-3xl pt-10 md:mx-0 md:max-w-[50rem]">
        <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/70 px-4 py-1.5 text-xs text-slate-600 backdrop-blur">
          <Sparkles className="size-3.5 text-sky-600" />
          Understand → Investigate → Resolve → Prevent
        </span>

        <h1 style={DISPLAY} className="text-4xl font-semibold leading-[1.05] tracking-tight text-slate-900 md:text-[80px]">
          Support that understands
          <br />
          <span className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-500 bg-clip-text text-transparent">what happened</span>
        </h1>

        <p className="mx-auto mt-6 max-w-lg md:mx-0 md:mx-0 text-balance text-sm leading-relaxed text-slate-600 md:text-base">
          One customer, one complaint, one continuous context — across chat, voice, phone, and human handoff.
        </p>

        <div className="pointer-events-auto mt-9 flex flex-wrap items-center justify-center gap-3 md:justify-start">
          <Button asChild size="lg" className="group rounded-full bg-slate-900 px-6 text-white shadow-[0_10px_30px_-10px_rgba(15,23,42,0.6)] transition-all hover:bg-slate-800">
            <Link to="/support">
              Get Support
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="ghost" className="rounded-full px-6 text-slate-600 hover:bg-slate-900/5 hover:text-slate-900">
            <Link to="/agent">View Agent Dashboard</Link>
          </Button>
        </div>
      </div>

      {/* chat widget mockup */}
      <div className="relative z-10 mx-auto mt-16 max-w-xl md:mt-[40px] md:max-w-[42rem]">
        <div
          aria-hidden
          className="absolute -inset-x-10 -inset-y-6 rounded-[36px] opacity-70 blur-3xl"
          style={{ background: "radial-gradient(60% 60% at 50% 40%, rgba(45,212,191,0.22), rgba(56,132,255,0.18), transparent 75%)" }}
        />

        <div className="relative rounded-2xl bg-gradient-to-br from-teal-300/60 via-sky-500/30 to-indigo-500/40 p-px shadow-[0_24px_80px_-20px_rgba(20,90,200,0.7)]">
          <div className="overflow-hidden rounded-2xl bg-[#080c18] text-left">
            <div className="flex items-center gap-2 border-b border-white/[0.07] bg-white/[0.02] px-4 py-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[11px] tracking-wide text-white/45">
                ResolveAI / Complaint <span className="font-mono text-white/70">RSV-1042</span>
              </span>
            </div>

            <div className="space-y-1.5 px-4 py-2">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-500">
                  <Sparkles className="size-3 text-white" />
                </span>
                <div className="max-w-[80%] rounded-2xl rounded-tl-sm border border-white/[0.06] bg-white/[0.05] px-4 py-2.5 text-sm text-white/80">
                  👋 Hi, I found a duplicate charge on your last payment. Pulling the transaction now.
                </div>
              </div>

              <div className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-tr-sm border border-sky-400/20 bg-sky-500/[0.12] px-4 py-2.5 text-sm text-sky-100">
                Yes — TX-92841, charged twice on the same order.
              </div>

              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-500">
                  <Sparkles className="size-3 text-white" />
                </span>
                <div className="max-w-[85%] flex-1 space-y-2.5 rounded-2xl rounded-tl-sm border border-white/[0.06] bg-white/[0.05] px-4 py-3 text-sm text-white/80">
                  <span>Duplicate confirmed against the original charge.</span>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
                    <div className="h-full w-[91%] rounded-full bg-gradient-to-r from-teal-300 via-sky-400 to-indigo-400 shadow-[0_0_12px_rgba(56,132,255,0.8)]" />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-white/40">
                    <span className="font-mono">91% confidence</span>
                    <span>refund recommended</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-white/[0.07] bg-white/[0.02] px-4 py-2">
              <Plus className="size-4 text-white/35" />
              <Paperclip className="size-4 text-white/35" />
              <span className="flex-1 text-sm text-white/25">Ask ResolveAI anything…</span>
              <span className="flex size-7 items-center justify-center rounded-full bg-white/[0.06]">
                <Mic className="size-3.5 text-white/50" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* channel strip */}
      <div className="relative mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 md:justify-start">
        {CHANNELS.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2 text-slate-400">
            <Icon className="size-4" />
            <span className="text-xs tracking-wide">{label}</span>
          </div>
        ))}
        <span className="text-xs text-slate-400">— one thread, every channel</span>
      </div>
    </div>
  );
};
