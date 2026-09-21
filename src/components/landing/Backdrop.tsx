const FADE_DOWN =
  "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 45%, rgba(0,0,0,0.5) 72%, transparent 96%)";

export const LightRays = () => (
  <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[680px] overflow-hidden">
    <div
      className="absolute inset-0 blur-[3px]"
      style={{
        backgroundImage: `repeating-linear-gradient(90deg,
          transparent 0px, transparent 26px,
          rgba(150,190,255,0.55) 26px, rgba(150,190,255,0.55) 30px,
          transparent 30px, transparent 74px,
          rgba(110,155,255,0.38) 74px, rgba(110,155,255,0.38) 77px,
          transparent 77px, transparent 132px)`,
        maskImage: FADE_DOWN,
        WebkitMaskImage: FADE_DOWN,
      }}
    />
    <div
      className="absolute inset-0 translate-x-[13px] blur-[5px]"
      style={{
        backgroundImage: `repeating-linear-gradient(90deg,
          transparent 0px, transparent 44px,
          rgba(168,140,255,0.45) 44px, rgba(168,140,255,0.45) 48px,
          transparent 48px, transparent 98px,
          rgba(210,225,255,0.28) 98px, rgba(210,225,255,0.28) 101px,
          transparent 101px, transparent 186px)`,
        maskImage: FADE_DOWN,
        WebkitMaskImage: FADE_DOWN,
      }}
    />
    <div
      className="absolute inset-x-0 top-0 h-72"
      style={{ background: "linear-gradient(to bottom, rgba(150,180,255,0.55), rgba(110,130,255,0.22) 40%, rgba(80,90,200,0.06) 70%, transparent)" }}
    />
    <div className="absolute -left-40 -top-56 h-[520px] w-[620px] rounded-full blur-[120px]" style={{ background: "radial-gradient(closest-side, rgba(120,90,255,0.45), transparent 72%)" }} />
    <div className="absolute -right-40 -top-56 h-[520px] w-[620px] rounded-full blur-[120px]" style={{ background: "radial-gradient(closest-side, rgba(70,130,255,0.42), transparent 72%)" }} />
    <div
      className="absolute left-1/2 top-[-200px] h-[620px] w-[1000px] -translate-x-1/2 rounded-full blur-[130px]"
      style={{ background: "radial-gradient(closest-side, rgba(56,132,255,0.55), rgba(110,86,255,0.32), transparent 74%)" }}
    />
  </div>
);

export const Grain = () => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0 opacity-[0.16] mix-blend-overlay"
    style={{
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
    }}
  />
);

export const Starfield = ({ className = "" }: { className?: string }) => (
  <div
    aria-hidden
    className={`pointer-events-none absolute inset-0 ${className}`}
    style={{
      backgroundImage: `radial-gradient(1px 1px at 12% 18%, rgba(255,255,255,0.45), transparent),
        radial-gradient(1px 1px at 28% 42%, rgba(255,255,255,0.30), transparent),
        radial-gradient(1px 1px at 47% 12%, rgba(255,255,255,0.40), transparent),
        radial-gradient(1px 1px at 63% 33%, rgba(255,255,255,0.25), transparent),
        radial-gradient(1px 1px at 78% 20%, rgba(255,255,255,0.35), transparent),
        radial-gradient(1px 1px at 88% 55%, rgba(255,255,255,0.22), transparent),
        radial-gradient(1px 1px at 8% 66%, rgba(255,255,255,0.20), transparent),
        radial-gradient(1px 1px at 55% 72%, rgba(255,255,255,0.18), transparent)`,
    }}
  />
);


const SPLINE_SCENE = "https://my.spline.design/nexbotrobotcharacterconcept-ePJFkpBZaX3k6fuVfSY66LNp/";

const SPLINE_BLEND =
  "linear-gradient(to right, #ffffff 0%, rgba(255,255,255,0.92) 34%, rgba(255,255,255,0.38) 56%, rgba(255,255,255,0) 76%, rgba(255,255,255,0) 90%, #ffffff 100%), linear-gradient(to bottom, #ffffff 0%, rgba(255,255,255,0.3) 10%, rgba(255,255,255,0) 26%, rgba(255,255,255,0) 52%, rgba(255,255,255,0.85) 64%, #ffffff 72%)";

export const SplineRobot = ({ className = "" }: { className?: string }) => (
  <div
    aria-hidden
    className={"absolute inset-0 overflow-hidden " + className}
  >
    <iframe
      title="NEXBOT robot"
      src={SPLINE_SCENE}
      loading="eager"
      tabIndex={-1}
      className="absolute right-[60px] top-[60px] h-[620px] w-[640px] origin-center scale-[1.25] border-0"
    />
    <div className="pointer-events-none absolute inset-0" style={{ background: SPLINE_BLEND }} />
  </div>
);

export const WhiteScrim = () => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0"
    style={{
      background:
        "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.7) 86%, #ffffff 100%)",
    }}
  />
);
