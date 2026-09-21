import type { ReactNode } from "react";
import { Headphones, type LucideIcon, Mail, MessageSquare, Mic, Phone, Share2, Sparkles, Workflow } from "lucide-react";
import { AmbientVideo } from "@/components/landing/AmbientVideo";
import { Grain, Starfield } from "@/components/landing/Backdrop";

const DISPLAY = { fontFamily: '"Space Grotesk", system-ui, sans-serif' };

type Feature = { icon: LucideIcon; title: string; highlight: string; description: string; graphic: ReactNode };

const ChannelHub = () => (
  <div className="relative flex h-full items-center justify-center">
    <Starfield className="opacity-60" />
    <div aria-hidden className="absolute size-32 rounded-full blur-2xl" style={{ background: "radial-gradient(circle, rgba(88,150,255,0.45), transparent 70%)" }} />
    <div aria-hidden className="absolute h-px w-56 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    <div className="relative flex items-center gap-3">
      {[MessageSquare, Phone].map((Icon, i) => (
        <div key={i} className="flex size-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-white/35 backdrop-blur"><Icon className="size-4" /></div>
      ))}
      <div className="relative mx-1">
        <div aria-hidden className="absolute -inset-2 rounded-full blur-md" style={{ background: "radial-gradient(circle, rgba(120,170,255,0.65), transparent 70%)" }} />
        <div className="relative flex size-12 items-center justify-center rounded-full border border-sky-300/40 bg-gradient-to-b from-sky-400/30 to-indigo-500/30 shadow-[0_0_28px_rgba(90,150,255,0.55)]">
          <Sparkles className="size-5 text-sky-100" />
        </div>
      </div>
      {[Mic, Mail].map((Icon, i) => (
        <div key={i} className="flex size-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-white/35 backdrop-blur"><Icon className="size-4" /></div>
      ))}
    </div>
  </div>
);

const PromptStack = () => (
  <div className="flex h-full flex-col justify-center gap-3 px-6">
    <div className="flex items-center gap-2.5 rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500 px-3 py-2.5 shadow-[0_8px_30px_-6px_rgba(80,110,255,0.8)]">
      <span className="flex size-5 items-center justify-center rounded-full bg-white/25"><Sparkles className="size-3 text-white" /></span>
      <span className="text-xs text-white/95">Ask ResolveAI anything</span>
    </div>
    <div className="space-y-2 rounded-2xl border border-white/[0.06] bg-white/[0.045] px-4 py-3">
      <div className="h-1.5 w-full rounded-full bg-white/[0.14]" />
      <div className="h-1.5 w-2/3 rounded-full bg-white/[0.09]" />
    </div>
    <div className="mx-4 h-5 rounded-b-2xl border-x border-b border-white/[0.04] bg-white/[0.02]" />
  </div>
);

const HandoffPanel = () => (
  <div className="relative flex h-full items-center justify-center px-5">
    <div aria-hidden className="absolute left-4 h-32 w-24 rounded-full blur-2xl" style={{ background: "radial-gradient(circle, rgba(110,140,255,0.5), transparent 70%)" }} />
    <div className="relative w-full overflow-hidden rounded-xl border border-white/[0.08] bg-[#0a0f1e]/90 p-4 shadow-2xl">
      <span aria-hidden className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-sky-300 via-indigo-400 to-transparent" />
      <p className="mb-3 text-[11px] leading-relaxed text-white/75">Transferring to a human agent — transcript and summary attached.</p>
      <div className="space-y-1.5">
        <div className="h-1 w-full rounded-full bg-white/[0.10]" />
        <div className="h-1 w-4/5 rounded-full bg-white/[0.07]" />
        <div className="h-1 w-3/5 rounded-full bg-white/[0.05]" />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="flex size-5 items-center justify-center rounded-full bg-gradient-to-br from-teal-300 to-sky-500"><Headphones className="size-2.5 text-white" /></span>
        <span className="text-[10px] text-white/35">agent joined · context preserved</span>
      </div>
    </div>
  </div>
);

const VoiceOrb = () => (
  <div className="relative flex h-full items-center justify-center">
    <Starfield className="opacity-50" />
    {[150, 116, 86].map((size, i) => (
      <div key={size} className="absolute rounded-full border border-white/[0.06]" style={{ height: size, width: size, opacity: 1 - i * 0.2 }} />
    ))}
    <div aria-hidden className="absolute size-28 rounded-full blur-2xl" style={{ background: "radial-gradient(circle, rgba(120,110,255,0.5), transparent 70%)" }} />
    <div className="relative size-[240px]">
      <AmbientVideo src="voice-orb" fit="contain" fade="none" className="opacity-95" />
      <div className="absolute inset-0 flex items-center justify-center motion-safe:hidden">
        <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-b from-sky-300 via-indigo-400 to-violet-500 shadow-[0_0_40px_rgba(110,120,255,0.7)]">
          <Mic className="size-5 text-white" />
        </div>
      </div>
    </div>
  </div>
);

const FEATURES: Feature[] = [
  { icon: Workflow, title: "One Continuous", highlight: "Context", description: "Chat, web voice, and phone stay tied to the same complaint — nobody has to repeat themselves.", graphic: <ChannelHub /> },
  { icon: Sparkles, title: "AI-Powered", highlight: "Investigation", description: "Evidence, a confidence score, and a clear recommendation — surfaced before anything is actioned.", graphic: <PromptStack /> },
  { icon: Share2, title: "Seamless Human", highlight: "Handoff", description: "Complex cases transfer to an agent who already has the transcript, summary, and full history.", graphic: <HandoffPanel /> },
  { icon: Mic, title: "A Voice Agent", highlight: "That Listens", description: "Speak to ResolveAI from the same floating widget — and hand the call to a human without losing the thread.", graphic: <VoiceOrb /> },
];

export const FeatureGrid = () => {
  return (
    <section id="features" className="relative px-6 pb-28 md:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
          <h2 style={DISPLAY} className="max-w-md text-2xl font-semibold leading-snug tracking-tight text-slate-900 md:text-[32px]">
            Everything you need to
            <br />
            resolve issues faster
          </h2>
          <p className="max-w-[17rem] text-sm leading-relaxed text-slate-500">From AI-led investigation to a handoff that keeps every detail intact.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, highlight, description, graphic }) => (
            <div key={highlight} className="group relative rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_40px_-24px_rgba(15,23,42,0.45)] transition-transform duration-300 hover:-translate-y-0.5">
              <div className="relative overflow-hidden rounded-[19px] bg-white">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[110%] -translate-x-1/2 opacity-60 blur-3xl transition-opacity duration-300 group-hover:opacity-90"
                  style={{ background: "radial-gradient(closest-side, rgba(60,110,220,0.35), transparent 70%)" }}
                />
                <Grain />
                <div className="relative m-3 h-44 overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#0c1224] to-black/50">
                  <div className="absolute inset-0 bg-gradient-to-b from-sky-500/[0.07] to-transparent" />
                  {graphic}
                </div>
                <div className="relative px-5 pb-6 pt-2">
                  <div className="mb-3 flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sky-600">
                    <Icon className="size-4" />
                  </div>
                  <h3 style={DISPLAY} className="text-[17px] tracking-tight text-slate-500">
                    {title} <span className="font-semibold text-slate-900">{highlight}</span>
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
