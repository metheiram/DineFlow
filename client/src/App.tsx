import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Orders from "@/pages/orders";
import Menu from "@/pages/menu";
import Tables from "@/pages/tables";
import Checkout from "@/pages/checkout";
import Staff from "@/pages/staff";
import Reports from "@/pages/reports";
import LoginForm from "@/components/auth/login-form";
import Sidebar from "@/components/layout/sidebar";
import { useAuth } from "@/hooks/use-auth";

function AuthenticatedApp() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Switch>
          <Route path="/" component={() => <Redirect to="/dashboard" />} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/orders" component={Orders} />
          <Route path="/menu" component={Menu} />
          <Route path="/tables" component={Tables} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/staff" component={Staff} />
          <Route path="/reports" component={Reports} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-elegant-50 to-elegant-100">
        <div className="neu-card p-8 rounded-2xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return <AuthenticatedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
