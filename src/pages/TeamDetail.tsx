import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Users, Wallet, Trophy } from "lucide-react";
import { PlayerCard } from "@/components/auction/PlayerCard";

const TeamDetail = () => {
  const { teamId } = useParams();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeamDetails = async () => {
      try {
        const response = await fetch("https://auction.vardhamanpaper.com/api/team/individual_report", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // teamId: "66ff21a5e98e86bcc222b101",
            teamId: teamId,
          }),
        });
        if (!response.ok) {
          throw new Error("Failed to fetch team details");
        }
        const data = await response.json();
        if (data.data.length > 0) {
          setTeam(data.data[0]);
        } else {
          setTeam(null);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamDetails();
  }, [teamId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Loading team details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <p className="text-xl text-destructive">Error: {error}</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Team Not Found</h1>
          <Link to="/teams">
            <Button variant="outline">Back to Teams</Button>
          </Link>
        </div>
      </div>
    );
  }

  const budgetUsedPercentage = team.totalSpent && team.tournament.totalBudget
    ? (team.totalSpent / team.tournament.totalBudget) * 100
    : 0;

  const remainingSlots = team.tournament.maxPlayersPerTeam && team.players.length
    ? team.tournament.maxPlayersPerTeam - team.players.length
    : 0;

  return (
    <div className="min-h-screen bg-gradient-dark">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/teams">
          <Button variant="outline" className="mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Teams
          </Button>
        </Link>

        {/* Team Header */}
        <div className="mb-12 animate-fade-in">
          <div className="flex items-center gap-6 mb-8">
            <img
              src={team.logo}
              alt={`${team.name} logo`}
              className="h-32 w-32 rounded-full shadow-lg"
            />
            <div>
              <h1 className="text-5xl font-black text-foreground mb-2">{team.name}</h1>
              <p className="text-xl text-muted-foreground">Squad Details & Statistics</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Budget Card */}
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-2 border-border shadow-elevated">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Budget</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Budget</span>
                  <span className="font-bold text-foreground">
                    ₹{team.tournament.totalBudget}
                  </span>
                </div>
                <Progress value={budgetUsedPercentage} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Spent</span>
                  <span className="font-bold text-secondary">
                    ₹{team.totalSpent}
                  </span>
                </div>
                <div className="pt-2 border-t border-border">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Remaining</span>
                    <span className="font-bold text-accent">
                      ₹{team.remainingBudget} 
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Squad Card */}
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-2 border-border shadow-elevated">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-secondary/10">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Squad</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Max Players</span>
                  <span className="font-bold text-foreground">{team.tournament.maxPlayersPerTeam}</span>
                </div>
                <Progress 
                  value={(team.players.length / team.tournament.maxPlayersPerTeam) * 100} 
                  className="h-2" 
                />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current</span>
                  <span className="font-bold text-secondary">{team.players.length}</span>
                </div>
                <div className="pt-2 border-t border-border">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Slots Left</span>
                    <span className="font-bold text-accent">{remainingSlots}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Performance Card */}
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-2 border-border shadow-elevated">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-accent/10">
                  <Trophy className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Stats</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Players</p>
                  <p className="text-3xl font-black text-foreground">{team.players.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Avg. Price</p>
                  <p className="text-2xl font-bold text-secondary">
                    ₹{team.players.length > 0 
                      ? ((team.totalSpent / team.players.length)) 
                      : 0}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Players Section */}
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Squad Members ({team.players.length})
          </h2>
          
          {team.players.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {team.players.map((player, index) => (
                <div
                  key={player._id}
                  className="animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <PlayerCard player={player} />
                </div>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center bg-card/80 backdrop-blur-sm">
              <p className="text-xl text-muted-foreground">No players in squad yet</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamDetail;
