import { Switch, Route, Redirect, useRoute, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { IdleWarning } from "@/components/IdleWarning";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import NewAnalysis from "@/pages/new-analysis";
import AnalysisResult from "@/pages/analysis-result";
import HistoryPage from "@/pages/history";
import CreditsPage from "@/pages/credits";
import SettingsPage from "@/pages/settings";
import { Loader2 } from "lucide-react";
import { useAnalysisStore } from "@/store/analysis";

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0B1615]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#1BC1A1]" />
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, session, loading } = useAuth();

  if (user || session) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0B1615]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#1BC1A1]" />
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return <Redirect to="/login" />;
}

function AnalysisRedirect() {
  const [, params] = useRoute("/analysis/:id");
  const [, setLocation] = useLocation();
  const { setSelectedAnalysisId, setSelectedAnalysis } = useAnalysisStore();

  useEffect(() => {
    if (params?.id) {
      setSelectedAnalysis(null);
      setSelectedAnalysisId(params.id);
      setLocation("/");
    }
  }, [params?.id]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0B1615]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#1BC1A1]" />
        <p className="text-gray-400">Redirecionando...</p>
      </div>
    </div>
  );
}

function AppLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <SidebarInset className="bg-[#0B1615]">
      <header className="flex h-14 items-center gap-4 border-b border-[#1BC1A1]/15 bg-[#0F1F1D] px-4">
        <SidebarTrigger className="text-gray-400 hover:text-[#1BC1A1]" data-testid="button-sidebar-toggle" />
        {title && <h1 className="text-lg font-semibold text-white">{title}</h1>}
      </header>
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </SidebarInset>
  );
}

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full bg-[#0B1615]">
        <AppSidebar />
        {children}
      </div>
    </SidebarProvider>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <ProtectedRoute>
          <AuthenticatedLayout>
            <AppLayout title="Dashboard">
              <Dashboard />
            </AppLayout>
          </AuthenticatedLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/login">
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      </Route>
      <Route path="/new-analysis">
        <ProtectedRoute>
          <AuthenticatedLayout>
            <AppLayout title="Nova Análise">
              <NewAnalysis />
            </AppLayout>
          </AuthenticatedLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/analyze">
        <Redirect to="/new-analysis" />
      </Route>
      <Route path="/result">
        <ProtectedRoute>
          <AuthenticatedLayout>
            <AppLayout title="Resultado da Análise">
              <AnalysisResult />
            </AppLayout>
          </AuthenticatedLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/analysis/:id">
        <ProtectedRoute>
          <AuthenticatedLayout>
            <AnalysisRedirect />
          </AuthenticatedLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/history">
        <ProtectedRoute>
          <AuthenticatedLayout>
            <AppLayout title="Histórico">
              <HistoryPage />
            </AppLayout>
          </AuthenticatedLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/credits">
        <ProtectedRoute>
          <AuthenticatedLayout>
            <AppLayout title="Créditos">
              <CreditsPage />
            </AppLayout>
          </AuthenticatedLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute>
          <AuthenticatedLayout>
            <AppLayout title="Configurações">
              <SettingsPage />
            </AppLayout>
          </AuthenticatedLayout>
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <IdleWarning />
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
