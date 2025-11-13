import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useTheme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import StudentDashboard from "./pages/StudentDashboard";
import BusinessDashboard from "./pages/BusinessDashboard";
import TravelerDashboard from "./pages/TravelerDashboard";
import TourDetail from "./pages/TourDetail";
import SocialFeed from "./pages/SocialFeed";
import CreateTour from "./pages/CreateTour";
import Settings from "./pages/Settings";
import Account from "./pages/Account";
import PreviousTours from "./pages/PreviousTours";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="tourconnect-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/business/dashboard" element={<BusinessDashboard />} />
            <Route path="/traveler/dashboard" element={<TravelerDashboard />} />
            <Route path="/tour/:id" element={<TourDetail />} />
            <Route path="/business/tour/:id" element={<TourDetail />} />
            <Route path="/business/create-tour" element={<CreateTour />} />
            <Route path="/business/edit-tour/:id" element={<CreateTour />} />
            <Route path="/feed" element={<SocialFeed />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/account" element={<Account />} />
            <Route path="/previous-tours" element={<PreviousTours />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
