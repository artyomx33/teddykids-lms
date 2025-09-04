import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
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
// Grow Buddy
import OnboardingPage from "@/modules/growbuddy/pages/OnboardingPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="contracts" element={<Contracts />} />
            <Route path="contracts/dashboard" element={<ContractsDashboard />} />
            <Route path="generate-contract" element={<GenerateContract />} />
            <Route path="contract/view/:id" element={<ViewContract />} />
            <Route path="staff" element={<StaffPage />} />
            <Route path="staff/:id" element={<StaffProfile />} />
            <Route path="users" element={<Users />} />
            <Route path="settings" element={<Settings />} />
            {/* Grow Buddy */}
            <Route path="grow" element={<Navigate to="/grow/onboarding" replace />} />
            <Route path="grow/onboarding" element={<OnboardingPage />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
