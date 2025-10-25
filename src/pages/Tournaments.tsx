import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Calendar, DollarSign, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import apiConfig from "@/config/apiConfig";
import { setSelectedTournamentId } from "@/lib/tournamentUtils";

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
  }, []);

  const handleTournamentClick = (tournamentId: string) => {
    // Store the selected tournament ID in localStorage
    setSelectedTournamentId(tournamentId);
    // Navigate to players page
    navigate("/players");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN").format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Loading tournaments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Tournaments
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Select a tournament to view players and teams
          </p>
        </div>

        {/* Tournament Cards Grid */}
        {tournaments.length === 0 ? (
          <div className="text-center py-20">
            <Trophy className="h-20 w-20 text-muted-foreground mx-auto mb-4" />
            <p className="text-2xl text-muted-foreground">No tournaments found</p>
            <p className="text-muted-foreground mt-2">Create a new tournament to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament) => (
              <Card
                key={tournament._id}
                className="group hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-2 hover:border-primary"
                onClick={() => handleTournamentClick(tournament._id)}
              >
                <CardHeader className="bg-gradient-to-br from-primary/10 to-purple-600/10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2 group-hover:text-primary transition-colors">
                        {tournament.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(tournament.createdAt)}
                      </CardDescription>
                    </div>
                    <Trophy className="h-8 w-8 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-4">
                  {/* Teams Info */}
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <span className="font-medium">Teams</span>
                    </div>
                    <Badge variant="secondary" className="text-lg font-bold">
                      {tournament.noOfTeams}
                    </Badge>
                  </div>

                  {/* Players per Team */}
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <span className="font-medium">Players/Team</span>
                    </div>
                    <Badge variant="outline" className="text-base">
                      {tournament.minPlayersPerTeam} - {tournament.maxPlayersPerTeam}
                    </Badge>
                  </div>

                  {/* Budget */}
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <span className="font-medium">Budget</span>
                    </div>
                    <Badge variant="default" className="text-base font-bold">
                      ₹{formatCurrency(tournament.totalBudget)}
                    </Badge>
                  </div>

                  {/* Player Categories */}
                  {tournament.playerCategories && tournament.playerCategories.length > 0 && (
                    <div className="space-y-2">
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
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                    variant="outline"
                  >
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
