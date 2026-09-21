import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "Product", href: "#features" },
  { label: "How it works", href: "#workflow" },
  { label: "Agent Dashboard", to: "/agent" },
];

export const Navbar = () => {
  return (
    <header className="pointer-events-auto relative z-20 flex items-center justify-between px-6 py-6 md:px-10">
      <Link to="/" style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }} className="text-lg font-semibold tracking-tight text-slate-900">
        Resolve<span className="text-sky-600">AI</span>
      </Link>

      <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
        {NAV_LINKS.map((link) =>
          link.to ? (
            <Link key={link.label} to={link.to} className="transition-colors hover:text-slate-900">{link.label}</Link>
          ) : (
            <a key={link.label} href={link.href} className="transition-colors hover:text-slate-900">{link.label}</a>
          )
        )}
      </nav>

      <Button asChild size="sm" className="rounded-full bg-slate-900 px-5 text-white transition-colors hover:bg-slate-800">
        <Link to="/support">Get Support</Link>
      </Button>
    </header>
  );
};
