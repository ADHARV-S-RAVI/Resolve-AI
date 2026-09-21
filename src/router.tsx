import { lazy, Suspense, type ReactNode } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const SupportHub = lazy(() => import("./pages/support/SupportHub"));
const ChatPage = lazy(() => import("./pages/support/ChatPage"));
const TicketDetail = lazy(() => import("./pages/support/TicketDetail"));
const AgentDashboard = lazy(() => import("./pages/agent/AgentDashboard"));
const AgentTicket = lazy(() => import("./pages/agent/AgentTicket"));
const CallDetail = lazy(() => import("./pages/agent/CallDetail"));

function route(element: ReactNode) {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">Opening your ResolveAI workspace…</div>}>
      {element}
    </Suspense>
  );
}

export const routers = [
  { path: "/", name: "home", element: <Index /> },
  { path: "/support", name: "customer-dashboard", element: route(<SupportHub />) },
  { path: "/chat", name: "chat", element: route(<ChatPage />) },
  { path: "/tickets/:id", name: "customer-ticket", element: route(<TicketDetail />) },
  { path: "/agent", name: "agent-dashboard", element: route(<AgentDashboard />) },
  { path: "/agent/ticket/:id", name: "agent-ticket", element: route(<AgentTicket />) },
  { path: "/agent/calls/:callId", name: "call-workspace", element: route(<CallDetail />) },
  { path: "*", name: "404", element: <NotFound /> },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;
