import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
};

type AmbientVideoProps = {
  src: string;
  className?: string;
  fade?: "bottom" | "both" | "none";
  fit?: "cover" | "contain";
};

const FADES: Record<NonNullable<AmbientVideoProps["fade"]>, string | undefined> = {
  bottom: "linear-gradient(to bottom, rgba(0,0,0,1) 55%, transparent 100%)",
  both: "linear-gradient(to bottom, transparent, rgba(0,0,0,1) 25%, rgba(0,0,0,1) 70%, transparent)",
  none: undefined,
};

export const AmbientVideo = ({ src, className, fade = "bottom", fit = "cover" }: AmbientVideoProps) => {
  const reduced = usePrefersReducedMotion();
  if (reduced) return null;
  const mask = FADES[fade];
  return (
    <video
      aria-hidden
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      className={cn("pointer-events-none absolute inset-0 size-full", fit === "contain" ? "object-contain" : "object-cover", className)}
      style={{ mixBlendMode: "screen", maskImage: mask, WebkitMaskImage: mask }}
    >
      <source src={`${import.meta.env.BASE_URL}media/${src}.webm`} type="video/webm" />
      <source src={`${import.meta.env.BASE_URL}media/${src}.mp4`} type="video/mp4" />
    </video>
  );
};
