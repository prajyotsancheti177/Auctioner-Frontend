import { useState, useEffect } from "react";
import { PlayerCard } from "@/components/auction/PlayerCard";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { PlayerStatus } from "@/types/auction";

const Players = () => {
  const [players, setPlayers] = useState([]);
  const [filter, setFilter] = useState<PlayerStatus | "All" | "Remaining">("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch("http://13.233.149.244:3000/api/player/player_report", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            touranmentId: "671b0a000000000000000001",
          }),
        });
        if (!response.ok) {
          throw new Error("Failed to fetch players");
        }
        const data = await response.json();
        if (!Array.isArray(data.data)) {
          console.warn("API response does not contain a valid players array. Setting players to an empty array.");
          setPlayers([]);
        } else {
          // console.log("Fetched players:", data.data);
          setPlayers(data.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  const filteredPlayers = filter === "All"
    ? players
    : filter === "Sold"
    ? players.filter(p => p.sold === true)
    : filter === "Unsold"
    ? players.filter(p => p.auctionStatus === true && p.sold === false)
    : filter === "Remaining"
    ? players.filter(p => p.auctionStatus === false)
    : players;

  const soldCount = players.filter(p => p.sold === true).length;
  const unsoldCount = players.filter(p => p.auctionStatus === true && p.sold === false).length;
  const remainingCount = players.filter(p => p.auctionStatus === false).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Loading players...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-destructive">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-4 px-6 py-3 rounded-full bg-card border-2 border-primary shadow-glow">
            <Users className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">Player Registry</span>
          </div>
          <h1 className="text-5xl font-black bg-gradient-primary bg-clip-text text-transparent mb-4">
            All Players
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {players.length} registered players
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <p className="text-4xl font-black text-accent">{soldCount}</p>
              <p className="text-sm text-muted-foreground">Sold</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-destructive">{unsoldCount}</p>
              <p className="text-sm text-muted-foreground">Unsold</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-warning">{remainingCount}</p>
              <p className="text-sm text-muted-foreground">Remaining</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex justify-center gap-4">
            <Button
              variant={filter === "All" ? "default" : "outline"}
              onClick={() => setFilter("All")}
              className={filter === "All" ? "bg-gradient-primary" : ""}
            >
              All ({players.length})
            </Button>
            <Button
              variant={filter === "Sold" ? "default" : "outline"}
              onClick={() => setFilter("Sold")}
              className={filter === "Sold" ? "bg-gradient-accent" : ""}
            >
              Sold ({soldCount})
            </Button>
            <Button
              variant={filter === "Unsold" ? "default" : "outline"}
              onClick={() => setFilter("Unsold")}
              className={filter === "Unsold" ? "bg-gradient-secondary" : ""}
            >
              Unsold ({unsoldCount})
            </Button>
            <Button
              variant={filter === "Remaining" ? "default" : "outline"}
              onClick={() => setFilter("Remaining")}
              className={filter === "Remaining" ? "bg-gradient-warning" : ""}
            >
              Remaining ({remainingCount})
            </Button>
          </div>
        </div>

        {/* Players Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlayers.map((player, index) => (
            <div
              key={player._id}
              className="animate-scale-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <PlayerCard player={player} />
            </div>
          ))}
        </div>

        {filteredPlayers.length === 0 && (
          <div className="text-center py-20">
            <p className="text-2xl text-muted-foreground">No players found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Players;
