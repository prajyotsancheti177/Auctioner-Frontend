import { Link, useLocation } from "react-router-dom";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import path from "path";

const navLinks = [
  {path:"/auction", label: "Live Auction"},
  { path: "/", label: "Players" },
  { path: "/teams", label: "All Teams" },
];

export const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="rounded-lg bg-gradient-primary p-2 shadow-glow transition-all group-hover:scale-110">
              <Trophy className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Cricket Auction
            </span>
          </Link>

          <div className="flex gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-all",
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
