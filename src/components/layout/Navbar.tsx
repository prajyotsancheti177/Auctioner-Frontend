import { Link, useLocation, useNavigate } from "react-router-dom";
import { Trophy, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const buildNavLinks = () => {
  let showAuction = false;
  let showUsers = false;
  let showManageTournaments = false;
  let showBulkUpload = false;
  let isAuthenticated = false;

  try {
    isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    
    const password =
      typeof window !== "undefined"
        ? localStorage.getItem("auction-password")
        : null;
    if (password === "pushkar_champion") {
      showAuction = true;
    }

    showAuction = true;

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
    { path: "/tournaments", label: "Tournaments" },
  ];

  // Protected links (only for authenticated users)
  if (showManageTournaments) {
    links.push({ path: "/tournaments/manage", label: "Manage Tournaments" });
  }
  
  if (showBulkUpload) {
    links.push({ path: "/bulk-upload", label: "Bulk Upload" });
  }

  if (showAuction) {
    links.unshift({ path: "/auction", label: "Live Auction" });
  }

  if (showUsers) {
    links.unshift({ path: "/users", label: "Users" });
  }

  return links;
};

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
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

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="container mx-auto px-3">
        <div className="flex h-12 md:h-16 items-center justify-between">
          <Link to="/tournaments" className="flex items-center gap-2 group">
            <div className="rounded-lg bg-gradient-primary p-1.5 md:p-2 shadow-glow transition-all group-hover:scale-110">
              <Trophy className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
            </div>
            <span className="text-sm md:text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Cricket Auction
            </span>
          </Link>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex gap-1 overflow-x-auto no-scrollbar">
              {buildNavLinks().map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "px-2 md:px-4 py-1 md:py-2 rounded-lg font-medium text-sm md:text-base transition-all whitespace-nowrap",
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
              <div className="flex items-center gap-2 border-l pl-2 md:pl-4">
                <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{userName}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-1 md:gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 border-l pl-2 md:pl-4">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate("/login")}
                  className="gap-1 md:gap-2"
                >
                  <User className="h-4 w-4" />
                  <span>Login</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
