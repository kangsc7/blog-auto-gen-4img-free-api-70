
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AdminUsers from "./pages/AdminUsers";
import AdminKeywords from "./pages/AdminKeywords";
import YoutubeGenerator from "./pages/YoutubeGenerator";
import InfographicGenerator from "./pages/InfographicGenerator";
import Pricing from "./pages/Pricing";
import Payment from "./pages/Payment";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/keywords" element={<AdminKeywords />} />
          <Route path="/youtube-generator" element={<YoutubeGenerator />} />
          <Route path="/infographic-generator" element={<InfographicGenerator />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/payment" element={<Payment />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
