import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SessionProvider, useSession } from "./lib/session";
import { Toaster } from "sonner";
import "../src/styles.css";

// Route components
import LoginPage from "./routes/index";
import ForgotPasswordPage from "./routes/auth/forgot-password";
import SignupPage from "./routes/auth/signup";
import ResetPasswordPage from "./routes/auth/reset-password";
import { AppLayout } from "./components/layout/AppLayout";

// App route components
import Dashboard from "./routes/app/dashboard";
import Assets from "./routes/app/assets";
import Allocations from "./routes/app/allocations";
import Bookings from "./routes/app/bookings";
import Maintenance from "./routes/app/maintenance";
import Audits from "./routes/app/audits";
import Departments from "./routes/app/departments";
import Categories from "./routes/app/categories";
import Employees from "./routes/app/employees";
import Reports from "./routes/app/reports";
import Notifications from "./routes/app/notifications";
import Profile from "./routes/app/profile";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, hydrated } = useSession();
  
  if (!hydrated) {
    return null; // or loading spinner
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            
            {/* Protected routes */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="assets" element={<Assets />} />
              <Route path="allocations" element={<Allocations />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="maintenance" element={<Maintenance />} />
              <Route path="audits" element={<Audits />} />
              <Route path="departments" element={<Departments />} />
              <Route path="categories" element={<Categories />} />
              <Route path="employees" element={<Employees />} />
              <Route path="reports" element={<Reports />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            
            {/* Redirect old routes to new structure */}
            <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="/assets" element={<Navigate to="/app/assets" replace />} />
            <Route path="/allocations" element={<Navigate to="/app/allocations" replace />} />
            <Route path="/bookings" element={<Navigate to="/app/bookings" replace />} />
            <Route path="/maintenance" element={<Navigate to="/app/maintenance" replace />} />
            <Route path="/audits" element={<Navigate to="/app/audits" replace />} />
            <Route path="/departments" element={<Navigate to="/app/departments" replace />} />
            <Route path="/categories" element={<Navigate to="/app/categories" replace />} />
            <Route path="/employees" element={<Navigate to="/app/employees" replace />} />
            <Route path="/reports" element={<Navigate to="/app/reports" replace />} />
            <Route path="/notifications" element={<Navigate to="/app/notifications" replace />} />
            <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
            
            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster richColors closeButton position="top-right" />
        </BrowserRouter>
      </SessionProvider>
    </QueryClientProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
