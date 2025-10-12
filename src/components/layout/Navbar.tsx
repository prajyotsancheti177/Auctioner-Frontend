import { Link, useLocation } from "react-router-dom";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import path from "path";

const buildNavLinks = () => {
  let showAuction = false;

  try {
    const password =
      typeof window !== "undefined"
        ? localStorage.getItem("auction-password")
        : null;
    if (password === "pushkar_champion") {
      showAuction = true;
    }
  } catch {
    // ignore localStorage errors
  }

  const links = [
    { path: "/", label: "Players" },
    { path: "/teams", label: "All Teams" },
  ];

  if (showAuction) {
    links.unshift({ path: "/auction", label: "Live Auction" });
  }

  return links;
};

export const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="container mx-auto px-3">
        <div className="flex h-12 md:h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="rounded-lg bg-gradient-primary p-1.5 md:p-2 shadow-glow transition-all group-hover:scale-110">
              <Trophy className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
            </div>
            <span className="text-sm md:text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Cricket Auction
            </span>
          </Link>

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
        </div>
      </div>
    </nav>
  );
};
