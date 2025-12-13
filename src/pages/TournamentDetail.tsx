import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Calendar, DollarSign, ArrowLeft, UserCircle, Shield, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import apiConfig from "@/config/apiConfig";
import { setSelectedTournamentId } from "@/lib/tournamentUtils";
import { trackEvent, trackPageView } from "@/lib/eventTracker";

interface Tournament {
  _id: string;
  name: string;
  tournamentHostId?: {
    _id: string;
    name: string;
    email: string;
  };
  noOfTeams?: number;
  maxPlayersPerTeam?: number;
  minPlayersPerTeam?: number;
  totalBudget?: number;
  playerCategories?: string[];
  createdAt?: string;
  updatedAt?: string;
}

const TournamentDetail = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tournamentId) {
      navigate("/tournaments");
      return;
    }

    // Store the selected tournament ID
    setSelectedTournamentId(tournamentId);

    const fetchTournament = async () => {
      try {
        const userStr = localStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;

        const response = await fetch(`${apiConfig.baseUrl}/api/tournament/detail`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tournamentId,
            userId: user?._id || "",
            userRole: user?.role || "guest",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch tournament details");
        }

        const data = await response.json();
        setTournament(data.data || null);
      } catch (err) {
        console.error("Error fetching tournament:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch tournament");
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
    // Track page view
    trackPageView(`/tournament/${tournamentId}`, tournamentId);
  }, [tournamentId, navigate]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "0";
    return new Intl.NumberFormat("en-IN").format(amount);
  };

  const handleViewPlayers = () => {
    trackEvent("players_view", { tournamentId }, tournamentId);
    navigate("/players");
  };

  const handleViewTeams = () => {
    trackEvent("teams_view", { tournamentId }, tournamentId);
    navigate("/teams");
  };

  const handleRegisterPlayer = () => {
    navigate("/register");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Loading tournament details...</p>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-destructive mb-4">{error || "Tournament not found"}</p>
          <Button onClick={() => navigate("/tournaments")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tournaments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/tournaments")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tournaments
        </Button>

        {/* Tournament Header */}
        <Card className="mb-6 border-2 border-primary/20">
          <CardHeader className="bg-gradient-to-br from-primary/10 to-purple-600/10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-4xl mb-3 flex items-center gap-3">
                  <Trophy className="h-10 w-10 text-primary" />
                  {tournament.name || "Unnamed Tournament"}
                </CardTitle>
                <CardDescription className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Created on {formatDate(tournament.createdAt)}
                </CardDescription>
              </div>
            </div>

            {tournament.tournamentHostId && (
              <div className="mt-4 flex items-center gap-2 text-muted-foreground">
                <Shield className="h-5 w-5" />
                <span className="font-medium">Host:</span>
                <span>{tournament.tournamentHostId.name}</span>
                <span className="text-sm">({tournament.tournamentHostId.email})</span>
              </div>
            )}
          </CardHeader>

          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Teams Info */}
              <div className="p-4 bg-muted rounded-lg text-center">
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-1">Teams</p>
                <p className="text-3xl font-bold">{tournament.noOfTeams || 0}</p>
              </div>

              {/* Players per Team */}
              <div className="p-4 bg-muted rounded-lg text-center">
                <UserCircle className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-1">Players per Team</p>
                <p className="text-3xl font-bold">
                  {tournament.minPlayersPerTeam || 0} - {tournament.maxPlayersPerTeam || 0}
                </p>
              </div>

              {/* Budget */}
              <div className="p-4 bg-muted rounded-lg text-center">
                <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-1">Total Budget</p>
                <p className="text-3xl font-bold">₹{formatCurrency(tournament.totalBudget)}</p>
              </div>
            </div>

            {/* Player Categories */}
            {tournament.playerCategories && tournament.playerCategories.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Player Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {tournament.playerCategories.map((category, index) => (
                    <Badge key={index} variant="secondary" className="text-base py-2 px-4">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* View Players Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-2 hover:border-primary">
            <CardHeader className="bg-gradient-to-br from-blue-500/10 to-blue-600/10">
              <CardTitle className="text-2xl flex items-center gap-2">
                <UserCircle className="h-8 w-8 text-blue-500" />
                Players
              </CardTitle>
              <CardDescription>
                View all players in this tournament
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-4">
                Browse through all registered players, view their details, and manage player information.
              </p>
              <Button
                onClick={handleViewPlayers}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                View Players
              </Button>
            </CardContent>
          </Card>

          {/* View Teams Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-2 hover:border-primary">
            <CardHeader className="bg-gradient-to-br from-green-500/10 to-green-600/10">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Users className="h-8 w-8 text-green-500" />
                Teams
              </CardTitle>
              <CardDescription>
                View all teams in this tournament
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-4">
                See all participating teams, their rosters, budgets, and performance statistics.
              </p>
              <Button
                onClick={handleViewTeams}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                View Teams
              </Button>
            </CardContent>
          </Card>

          {/* Register Player Card */}
          {/* <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-2 hover:border-primary">
            <CardHeader className="bg-gradient-to-br from-purple-500/10 to-purple-600/10">
              <CardTitle className="text-2xl flex items-center gap-2">
                <UserPlus className="h-8 w-8 text-purple-500" />
                Register Player
              </CardTitle>
              <CardDescription>
                Add a new player to this tournament
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-4">
                Register new players for the tournament and manage their details and categories.
              </p>
              <Button
                onClick={handleRegisterPlayer}
                className="w-full bg-purple-500 hover:bg-purple-600"
              >
                Register Player
              </Button>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  );
};

export default TournamentDetail;
