import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Trophy, LogOut, User, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/eventTracker";

const buildNavLinks = () => {
  let showAuction = false;
  let showUsers = false;
  let showManageTournaments = false;
  let showBulkUpload = false;
  let isAuthenticated = false;

  try {
    isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

    // Only show auction link for authenticated users
    if (isAuthenticated) {
      showAuction = true;
    }

    // Check if user is boss or super_user
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role === 'boss' || user.role === 'super_user') {
        showUsers = true;
      }
      // Show manage tournaments for authenticated users
      showManageTournaments = true;

      // Show bulk upload for tournament_host and above
      if (user.role === 'tournament_host' || user.role === 'super_user' || user.role === 'boss') {
        showBulkUpload = true;
      }
    }
  } catch {
    // ignore localStorage errors
  }

  // Public links (always visible)
  const links = [
    { path: "/", label: "Home" },
    { path: "/tournaments", label: "Tournaments" },
  ];

  // Protected links (only for authenticated users)
  if (showManageTournaments) {
    links.push({ path: "/tournaments/manage", label: "Manage Tournaments" });
  }

  if (showBulkUpload) {
    links.push({ path: "/bulk-upload", label: "Bulk Upload" });
  }

  // Live Auction is now public for viewers
  links.unshift({ path: "/auction", label: "Live Auction" });

  if (showUsers) {
    links.unshift({ path: "/users", label: "Users" });
    links.push({ path: "/analytics", label: "Analytics" });
  }

  return links;
};

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    // Track logout event before clearing user data
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      trackEvent("logout", { userId: user._id, role: user.role });
    }

    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    setMobileMenuOpen(false);
    navigate("/tournaments"); // Redirect to public page instead of login
  };

  const getUserName = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.name;
      }
    } catch {
      return null;
    }
    return null;
  };

  const userName = getUserName();
  const navLinks = buildNavLinks();

  const handleNavClick = (path: string) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="container mx-auto px-3">
        <div className="flex h-14 md:h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/tournaments" className="flex items-center gap-2 group">
            <div className="bg-white px-2 rounded-lg shadow-glow transition-transform group-hover:scale-105 overflow-hidden flex items-center justify-center">
              <img
                src="/src/assets/logo.png"
                alt="Vardhaman cricBid"
                className="h-10 md:h-14 w-[200px] object-contain scale-[1.9]"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium text-base transition-all whitespace-nowrap",
                    location.pathname === link.path
                      ? "bg-gradient-primary text-primary-foreground shadow-glow"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {userName ? (
              <div className="flex items-center gap-2 border-l pl-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{userName}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 border-l pl-4">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate("/login")}
                  className="gap-2"
                >
                  <User className="h-4 w-4" />
                  <span>Login</span>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {userName ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-9 w-9"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate("/login")}
                className="gap-1 h-9"
              >
                <User className="h-4 w-4" />
                <span className="text-sm">Login</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-9 w-9"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card/95 backdrop-blur-xl">
          <div className="container mx-auto px-3 py-4">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => handleNavClick(link.path)}
                  className={cn(
                    "px-4 py-3 rounded-lg font-medium text-left transition-all",
                    location.pathname === link.path
                      ? "bg-gradient-primary text-primary-foreground shadow-glow"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {link.label}
                </button>
              ))}
              {userName && (
                <div className="mt-2 pt-2 border-t border-border">
                  <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Logged in as {userName}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
