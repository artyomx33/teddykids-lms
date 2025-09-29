import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CelebrationTrigger } from "@/components/celebrations/CelebrationTrigger";
import { Layout } from "./components/Layout";
import { useAuth } from "./hooks/useAuth";
import { Loader2 } from "lucide-react";
import Dashboard from "./pages/Dashboard";
import ContractsDashboard from "./pages/ContractsDashboard";
import Contracts from "./pages/Contracts";
import GenerateContract from "./pages/GenerateContract";
import ViewContract from "./pages/ViewContract";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import StaffPage from "./pages/Staff";
import StaffProfile from "./pages/StaffProfile";
import Interns from "./pages/Interns";
import Reviews from "./pages/Reviews";
import Reports from "./pages/Reports";
import ActivityFeed from "./pages/ActivityFeed";
import Insights from "./pages/Insights";
import Email from "./pages/Email";
import GmailCallback from "./pages/GmailCallback";
import Auth from "./pages/Auth";
import EmployesSync from "./pages/EmployesSync";
// Labs 2.0
import { LabsLayout } from "./components/labs/LabsLayout";
import LabsOverview from "./pages/labs/LabsOverview";
import ContractDNA from "./pages/labs/ContractDNA";
import QuantumDashboard from "./pages/labs/QuantumDashboard";
import EmotionalIntelligence from "./pages/labs/EmotionalIntelligence";
// Grow Buddy
import OnboardingPage from "@/modules/growbuddy/pages/OnboardingPage";
import { KnowledgePage } from "@/modules/growbuddy/pages/KnowledgePage";
import DocumentReaderPage from "@/modules/growbuddy/pages/DocumentReaderPage";

const queryClient = new QueryClient();

const App = () => {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <CelebrationTrigger />
        <BrowserRouter 
          future={{ 
            v7_relativeSplatPath: true,
            v7_startTransition: true 
          }}
        >
          <Routes>
            {/* Auth route - accessible to everyone */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Gmail OAuth callback - outside Layout since it's a popup */}
            <Route path="/gmail-callback" element={<GmailCallback />} />
            
            {/* Protected routes */}
            {isAuthenticated ? (
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="staff" element={<StaffPage />} />
                <Route path="staff/:id" element={<StaffProfile />} />
                <Route path="interns" element={<Interns />} />
                <Route path="reviews" element={<Reviews />} />
                <Route path="contracts" element={<Contracts />} />
                <Route path="contracts/dashboard" element={<ContractsDashboard />} />
                <Route path="generate-contract" element={<GenerateContract />} />
                <Route path="contract/view/:id" element={<ViewContract />} />
                <Route path="reports" element={<Reports />} />
                <Route path="activity" element={<ActivityFeed />} />
                <Route path="insights" element={<Insights />} />
                <Route path="email" element={<Email />} />
                <Route path="employes-sync" element={<EmployesSync />} />
                <Route path="users" element={<Users />} />
                <Route path="settings" element={<Settings />} />
                {/* Labs 2.0 */}
                <Route path="labs/*" element={<LabsLayout />}>
                  <Route index element={<LabsOverview />} />
                  <Route path="dna" element={<ContractDNA />} />
                  <Route path="quantum" element={<QuantumDashboard />} />
                  <Route path="emotions" element={<EmotionalIntelligence />} />
                </Route>
                {/* Grow Buddy */}
                <Route path="grow" element={<Navigate to="/grow/onboarding" replace />} />
                <Route path="grow/onboarding" element={<OnboardingPage />} />
                <Route path="grow/knowledge" element={<KnowledgePage />} />
                <Route path="grow/knowledge/:slug" element={<DocumentReaderPage />} />
              </Route>
            ) : (
              <Route path="*" element={<Navigate to="/auth" replace />} />
            )}
            
            {/* Catch-all for authenticated users */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
