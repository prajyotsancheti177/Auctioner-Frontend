import { useState, useEffect } from "react";
import { PlayerCard } from "@/components/auction/PlayerCard";
import { PlayerDetailsModal } from "@/components/player/PlayerDetailsModal";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { PlayerStatus, Player } from "@/types/auction";
import apiConfig from "@/config/apiConfig";
import { getSelectedTournamentId } from "@/lib/tournamentUtils";

const Players = () => {
  const [players, setPlayers] = useState([]);
  const [filter, setFilter] = useState<PlayerStatus | "All" | "Remaining">("All");
  const [selectedCategory, setSelectedCategory] = useState<string | "All">("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const tournamentId = getSelectedTournamentId();
        const response = await fetch(`${apiConfig.baseUrl}/api/player/all`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            touranmentId: tournamentId,
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

  // derive available categories from players
  const categories = Array.from(
    new Set(players.map((p: any) => (p.playerCategory ? p.playerCategory : null)).filter(Boolean))
  );

  // First, filter by selected category so counts reflect the category selection
  const playersInCategory = selectedCategory === "All"
    ? players
    : players.filter((p: any) => p.playerCategory === selectedCategory);

  // apply status filter on playersInCategory
  const filteredPlayers = filter === "All"
    ? playersInCategory
    : filter === "Sold"
    ? playersInCategory.filter(p => p.sold === true)
    : filter === "Unsold"
    ? playersInCategory.filter(p => p.auctionStatus === true && p.sold === false)
    : filter === "Remaining"
    ? playersInCategory.filter(p => p.auctionStatus === false)
    : playersInCategory;

  const filteredBySearch = filteredPlayers.filter((p: any) => {
    if (!search) return true;
    return p.name.toLowerCase().includes(search.toLowerCase());
  });

  // counts (based on selected category)
  const soldCount = playersInCategory.filter(p => p.sold === true).length;
  const unsoldCount = playersInCategory.filter(p => p.auctionStatus === true && p.sold === false).length;
  const remainingCount = playersInCategory.filter(p => p.auctionStatus === false).length;

  // Modal handlers
  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPlayer(null);
  };

  const handlePlayerUpdate = (updatedPlayer: Player) => {
    // Update the player in the local state
    setPlayers(prev => prev.map(p => 
      p._id === updatedPlayer._id ? updatedPlayer : p
    ));
  };

  const handlePlayerDelete = (playerId: string) => {
    // Remove the player from the local state
    setPlayers(prev => prev.filter(p => p._id !== playerId));
  };

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
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full">
            {/* Search + Category: stack on mobile, inline on md+ */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search player name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-2 rounded-md bg-card border border-border text-foreground w-full md:w-64"
              />

              {/* Desktop label */}
              <label className="hidden md:block text-sm text-muted-foreground mr-2 self-center">Category:</label>

              {/* Category select: full width on mobile */}
              <div className="w-full md:w-auto">
                <label className="text-sm text-muted-foreground md:hidden mb-1 block">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 rounded-md bg-card border border-border text-foreground w-full"
                >
                  <option value="All">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter buttons: wrap and compact on mobile, normal on md+ */}
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <Button
                variant={filter === "All" ? "default" : "outline"}
                onClick={() => setFilter("All")}
                className={`${filter === "All" ? "bg-gradient-primary" : ""} px-3 py-1 text-sm md:px-4 md:py-2 md:text-base`}
              >
                All Players ({playersInCategory.length})
              </Button>
              <Button
                variant={filter === "Sold" ? "default" : "outline"}
                onClick={() => setFilter("Sold")}
                className={`${filter === "Sold" ? "bg-gradient-accent" : ""} px-3 py-1 text-sm md:px-4 md:py-2 md:text-base`}
              >
                Sold ({soldCount})
              </Button>
              <Button
                variant={filter === "Unsold" ? "default" : "outline"}
                onClick={() => setFilter("Unsold")}
                className={`${filter === "Unsold" ? "bg-gradient-secondary" : ""} px-3 py-1 text-sm md:px-4 md:py-2 md:text-base`}
              >
                Unsold ({unsoldCount})
              </Button>
              <Button
                variant={filter === "Remaining" ? "default" : "outline"}
                onClick={() => setFilter("Remaining")}
                className={`${filter === "Remaining" ? "bg-gradient-warning" : ""} px-3 py-1 text-sm md:px-4 md:py-2 md:text-base`}
              >
                Remaining ({remainingCount})
              </Button>
            </div>
          </div>
        </div>

        {/* Players Grid: single column on mobile for compact single-line cards */}
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredBySearch.map((player, index) => (
            <div
              key={player._id}
              className="animate-scale-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <PlayerCard player={player} onClick={handlePlayerClick} />
            </div>
          ))}
        </div>

        {filteredBySearch.length === 0 && (
          <div className="text-center py-20">
            <p className="text-2xl text-muted-foreground">No players found</p>
          </div>
        )}
      </div>

      {/* Player Details Modal */}
      <PlayerDetailsModal
        player={selectedPlayer}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onUpdate={handlePlayerUpdate}
        onDelete={handlePlayerDelete}
      />
    </div>
  );
};

export default Players;
