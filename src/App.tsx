import { useMemo } from "react";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CelebrationTrigger } from "@/components/celebrations/CelebrationTrigger";
import { Loader2 } from "lucide-react";
import {
  Navigate,
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";

import { Layout } from "./components/Layout";
import { useAuth } from "./hooks/useAuth";
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
// Grow Buddy
import OnboardingPage from "@/modules/growbuddy/pages/OnboardingPage";
import {
  KnowledgePageRoute,
  knowledgePageLoader,
} from "@/modules/growbuddy/pages/KnowledgePageRoute";

const queryClient = new QueryClient();

const App = () => {
  const { loading, isAuthenticated } = useAuth();

  const router = useMemo(
    () =>
      createBrowserRouter(
        createRoutesFromElements(
          <Route>
            <Route path="/auth" element={<Auth />} />
            <Route path="/gmail-callback" element={<GmailCallback />} />

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
                <Route path="users" element={<Users />} />
                <Route path="settings" element={<Settings />} />
                <Route path="grow" element={<Navigate to="/grow/onboarding" replace />} />
                <Route path="grow/onboarding" element={<OnboardingPage />} />
                <Route
                  path="grow/knowledge"
                  element={<KnowledgePageRoute />}
                  loader={knowledgePageLoader}
                />
              </Route>
            ) : (
              <Route path="*" element={<Navigate to="/auth" replace />} />
            )}

            {isAuthenticated && <Route path="*" element={<NotFound />} />}
          </Route>
        )
      ),
    [isAuthenticated]
  );

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
        <RouterProvider router={router} />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
