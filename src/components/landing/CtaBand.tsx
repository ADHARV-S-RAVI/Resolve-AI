import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AmbientVideo } from "@/components/landing/AmbientVideo";
import { Grain } from "@/components/landing/Backdrop";

const DISPLAY = { fontFamily: '"Space Grotesk", system-ui, sans-serif' };

export const CtaBand = () => {
  return (
    <section className="relative px-6 pb-24 md:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-[24px] border border-slate-900/10 bg-[#070b16]">
          <AmbientVideo src="glow-bands" className="opacity-[0.28]" fade="both" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[#070b16]/55"
            style={{
              maskImage: "radial-gradient(60% 70% at 50% 50%, rgba(0,0,0,1), transparent)",
              WebkitMaskImage: "radial-gradient(60% 70% at 50% 50%, rgba(0,0,0,1), transparent)",
            }}
          />
          <Grain />
          <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(70% 90% at 50% 120%, rgba(56,132,255,0.28), transparent 70%)" }} />

          <div className="relative flex flex-col items-center gap-6 px-6 py-20 text-center">
            <h2 style={DISPLAY} className="max-w-lg text-2xl font-semibold leading-snug tracking-tight text-white md:text-[34px]">
              Stop making customers
              <br />
              explain it twice
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-white/50">Every channel, every handoff, one thread that keeps the whole story.</p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="group rounded-full border border-white/20 bg-white/[0.08] px-6 text-white shadow-[0_0_30px_-8px_rgba(120,170,255,0.7)] backdrop-blur transition-all hover:bg-white/[0.14]">
                <Link to="/support">
                  Get Support
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="rounded-full px-6 text-white/60 hover:bg-white/5 hover:text-white">
                <Link to="/agent">View Agent Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">ResolveAI — Understand → Investigate → Resolve → Prevent</p>
      </div>
    </section>
  );
};
