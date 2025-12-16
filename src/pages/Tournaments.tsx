import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Calendar, DollarSign, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import apiConfig from "@/config/apiConfig";
import { setSelectedTournamentId } from "@/lib/tournamentUtils";
import { trackEvent, trackPageView } from "@/lib/eventTracker";

interface Tournament {
  _id: string;
  name: string;
  tournamentHostId: string;
  noOfTeams: number;
  maxPlayersPerTeam: number;
  minPlayersPerTeam: number;
  totalBudget: number;
  playerCategories: string[];
  createdAt: string;
  updatedAt: string;
}

const Tournaments = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await fetch(`${apiConfig.baseUrl}/api/tournament/all`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch tournaments");
        }

        const data = await response.json();
        setTournaments(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch tournaments");
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
    // Track page view
    trackPageView("/tournaments");
  }, []);

  const handleTournamentClick = (tournamentId: string, tournamentName: string) => {
    // Track tournament selection
    trackEvent("tournament_view", { tournamentId, tournamentName }, tournamentId);
    // Store the selected tournament ID in localStorage
    setSelectedTournamentId(tournamentId);
    // Navigate to tournament detail page
    navigate(`/tournament/${tournamentId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `${(amount / 100000).toFixed(1)}L`;
    }
    return new Intl.NumberFormat("en-IN").format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-base sm:text-xl text-muted-foreground">Loading tournaments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-base sm:text-xl text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} size="sm">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <Trophy className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-primary" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Tournaments
            </h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
            Select a tournament to view players and teams
          </p>
        </div>

        {/* Tournament Cards Grid */}
        {tournaments.length === 0 ? (
          <div className="text-center py-10 sm:py-20">
            <Trophy className="h-12 w-12 sm:h-20 sm:w-20 text-muted-foreground mx-auto mb-3 sm:mb-4" />
            <p className="text-lg sm:text-2xl text-muted-foreground">No tournaments found</p>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">Create a new tournament to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 md:gap-6">
            {tournaments.map((tournament) => (
              <Card
                key={tournament._id}
                className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] sm:hover:scale-105 cursor-pointer border hover:border-primary"
                onClick={() => handleTournamentClick(tournament._id, tournament.name)}
              >
                <CardHeader className="bg-gradient-to-br from-primary/10 to-purple-600/10 p-3 sm:p-4 md:p-6">
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm sm:text-lg md:text-2xl mb-0.5 sm:mb-2 group-hover:text-primary transition-colors truncate">
                        {tournament.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 text-xs sm:text-sm">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">{formatDate(tournament.createdAt)}</span>
                      </CardDescription>
                    </div>
                    <Trophy className="h-5 w-5 sm:h-8 sm:w-8 text-primary opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0 hidden sm:block" />
                  </div>
                </CardHeader>

                <CardContent className="p-2 sm:p-4 md:pt-6 space-y-1.5 sm:space-y-3 md:space-y-4">
                  {/* Teams & Players - Combined on mobile */}
                  <div className="flex items-center justify-between p-1.5 sm:p-3 bg-muted rounded-md sm:rounded-lg">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Users className="h-3 w-3 sm:h-5 sm:w-5 text-primary" />
                      <span className="font-medium text-xs sm:text-base">Teams</span>
                    </div>
                    <Badge variant="secondary" className="text-xs sm:text-lg font-bold px-1.5 sm:px-3">
                      {tournament.noOfTeams}
                    </Badge>
                  </div>

                  {/* Players per Team - Hidden on very small screens */}
                  <div className="hidden sm:flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <span className="font-medium">Players/Team</span>
                    </div>
                    <Badge variant="outline" className="text-base">
                      {tournament.minPlayersPerTeam}-{tournament.maxPlayersPerTeam}
                    </Badge>
                  </div>

                  {/* Budget */}
                  <div className="flex items-center justify-between p-1.5 sm:p-3 bg-muted rounded-md sm:rounded-lg">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <DollarSign className="h-3 w-3 sm:h-5 sm:w-5 text-primary" />
                      <span className="font-medium text-xs sm:text-base">Budget</span>
                    </div>
                    <Badge variant="default" className="text-xs sm:text-base font-bold px-1.5 sm:px-3">
                      ₹{formatCurrency(tournament.totalBudget)}
                    </Badge>
                  </div>

                  {/* Player Categories - Only on larger screens */}
                  {tournament.playerCategories && tournament.playerCategories.length > 0 && (
                    <div className="hidden md:block space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        Categories
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {tournament.playerCategories.map((category, index) => (
                          <Badge key={index} variant="secondary">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all text-xs sm:text-sm md:text-base py-1.5 sm:py-2"
                    variant="outline"
                    size="sm"
                  >
                    <span className="hidden sm:inline">View Details</span>
                    <span className="sm:hidden">View</span>
                    <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tournaments;

