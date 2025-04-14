import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Channels from "./pages/Channels";
import Category from "./pages/Category";
import Player from "./pages/Player";
import Guide from "./pages/Guide";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { useEffect, useState } from "react";
import { getCurrentUser } from "./lib/api";
import { User } from "./types";

const queryClient = new QueryClient();

// Auth Guard component to protect routes
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Login />} />
            
            {/* Protected routes */}
            <Route
              path="/home"
              element={
                <AuthGuard>
                  <Home />
                </AuthGuard>
              }
            />
            <Route
              path="/channels"
              element={
                <AuthGuard>
                  <Channels />
                </AuthGuard>
              }
            />
            <Route
              path="/category/:categoryName"
              element={
                <AuthGuard>
                  <Category />
                </AuthGuard>
              }
            />
            <Route
              path="/watch/:channelId"
              element={
                <AuthGuard>
                  <Player />
                </AuthGuard>
              }
            />
            <Route
              path="/guide"
              element={
                <AuthGuard>
                  <Guide />
                </AuthGuard>
              }
            />
            <Route
              path="/settings"
              element={
                <AuthGuard>
                  <Settings />
                </AuthGuard>
              }
            />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
