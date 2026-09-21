import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routers } from "./router";
import { DemoStoreProvider } from "./lib/demo/store";

const queryClient = new QueryClient();
const router = createBrowserRouter(routers);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <DemoStoreProvider>
          <RouterProvider router={router} />
        </DemoStoreProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
