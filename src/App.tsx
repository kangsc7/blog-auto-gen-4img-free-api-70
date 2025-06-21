
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import AdminUsers from '@/pages/AdminUsers';
import AdminKeywords from '@/pages/AdminKeywords';
import InfographicGenerator from '@/pages/InfographicGenerator';
import YoutubeGenerator from '@/pages/YoutubeGenerator';
import Pricing from '@/pages/Pricing';
import Payment from '@/pages/Payment';
import NotFound from '@/pages/NotFound';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/keywords" element={<AdminKeywords />} />
          <Route path="/infographic-generator" element={<InfographicGenerator />} />
          <Route path="/youtube-generator" element={<YoutubeGenerator />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
