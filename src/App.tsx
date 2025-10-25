import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import Auction from "./pages/Auction";
import Teams from "./pages/Teams";
import TeamDetail from "./pages/TeamDetail";
import Players from "./pages/Players";
import PlayerRegistration from "./pages/PlayerRegistration";
import Tournaments from "./pages/Tournaments";
import TournamentManagement from "./pages/TournamentManagement";
import UserManagement from "./pages/UserManagement";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-background text-foreground">
                  <Navbar />
                  <Routes>
                    <Route path="/" element={<Tournaments />} />
                    <Route path="/tournaments" element={<Tournaments />} />
                    <Route path="/tournaments/manage" element={<TournamentManagement />} />
                    <Route path="/auction" element={<Auction />} />
                    <Route path="/teams" element={<Teams />} />
                    <Route path="/team/:teamId" element={<TeamDetail />} />
                    <Route path="/players" element={<Players />} />
                    <Route path="/register" element={<PlayerRegistration />} />
                    <Route path="/users" element={<UserManagement />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
