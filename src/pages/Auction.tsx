import { useState, useEffect, useCallback } from "react";
import { AuctionPlayerCard } from "@/components/auction/AuctionPlayerCard";
import { PlayerDetailsModal } from "@/components/player/PlayerDetailsModal";
import { SoldCelebration } from "@/components/auction/SoldCelebration";
import { UnsoldAnimation } from "@/components/auction/UnsoldAnimation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Gavel, Search, Shuffle, Settings, Plus, Trash2, RefreshCcw } from "lucide-react";
import stadiumBg from "@/assets/stadium-bg.jpg";
import { useNavigate } from "react-router-dom";
import { Player } from "@/types/auction";
import apiConfig from "@/config/apiConfig";
import { getDriveThumbnail } from "@/lib/imageUtils";
import { getSelectedTournamentId } from "@/lib/tournamentUtils";
import { useToast } from "@/hooks/use-toast";


const Auction = () => {
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [currentBid, setCurrentBid] = useState(0);
  const [leadingTeam, setLeadingTeam] = useState<string | null>(null);
  const [leadingTeamId, setLeadingTeamId] = useState<string | null>(null);
  const [teamBids, setTeamBids] = useState<Record<string, number>>({});
  const [showCelebration, setShowCelebration] = useState(false);
  const [showUnsoldAnimation, setShowUnsoldAnimation] = useState(false);
  const [playerNumber, setPlayerNumber] = useState(1); // Track player number dynamically
  const [teams, setTeams] = useState([]); // Store fetched teams
  const [playerCategories, setPlayerCategories] = useState([]); // Store fetched player categories
  const [selectedCategory, setSelectedCategory] = useState(null); // Track selected category
  const [bidError, setBidError] = useState<Record<string, string>>({});
  const [bidPrice, setBidPrice] = useState(100);
  const [bidHistory, setBidHistory] = useState<Array<{ bid: number, teamId: string | null }>>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // Manual search mode states
  const [auctionMode, setAuctionMode] = useState<"category" | "manual" | null>(null);
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Bid increment settings
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [bidIncrementSlabs, setBidIncrementSlabs] = useState<Array<{
    minBid: number;
    maxBid: number | null;
    increment: number;
  }>>([]);
  const [tournamentData, setTournamentData] = useState<{
    _id: string;
    name: string;
    bidIncrementSlabs?: Array<{
      minBid: number;
      maxBid: number | null;
      increment: number;
    }>;
  } | null>(null);

  // Reset unsold players states
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetting, setResetting] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch tournament data including bid increment slabs
  useEffect(() => {
    const fetchTournamentData = async () => {
      try {
        const tournamentId = getSelectedTournamentId();
        const response = await fetch(`${apiConfig.baseUrl}/api/tournament/detail`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tournamentId: tournamentId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch tournament data");
        }

        const data = await response.json();
        setTournamentData(data.data);

        // Set bid increment slabs from tournament or use defaults
        if (data.data.bidIncrementSlabs && data.data.bidIncrementSlabs.length > 0) {
          setBidIncrementSlabs(data.data.bidIncrementSlabs);
        } else {
          // Default slabs if none exist
          setBidIncrementSlabs([
            { minBid: 0, maxBid: 499, increment: 50 },
            { minBid: 500, maxBid: null, increment: 100 }
          ]);
        }
      } catch (error) {
        console.error("Error fetching tournament data:", error);
        // Set default slabs on error
        setBidIncrementSlabs([
          { minBid: 0, maxBid: 499, increment: 50 },
          { minBid: 500, maxBid: null, increment: 100 }
        ]);
      }
    };

    fetchTournamentData();
  }, []);

  // Calculate current bid increment based on current bid and slabs
  const getCurrentBidIncrement = useCallback((currentBidAmount: number) => {
    // Sort slabs by minBid to ensure correct order
    const sortedSlabs = [...bidIncrementSlabs].sort((a, b) => a.minBid - b.minBid);

    // Find the applicable slab
    for (const slab of sortedSlabs) {
      if (slab.maxBid === null) {
        // This is the last slab (no upper limit)
        if (currentBidAmount >= slab.minBid) {
          return slab.increment;
        }
      } else {
        // Check if current bid falls within this slab
        if (currentBidAmount >= slab.minBid && currentBidAmount < slab.maxBid) {
          return slab.increment;
        }
      }
    }

    // Default fallback
    return 50;
  }, [bidIncrementSlabs]);

  // Add a new bid increment slab
  const addBidSlab = () => {
    const lastSlab = bidIncrementSlabs[bidIncrementSlabs.length - 1];
    const newMinBid = lastSlab.maxBid ? lastSlab.maxBid + 1 : lastSlab.minBid + 500;

    // Update last slab to have a maxBid
    const updatedSlabs = bidIncrementSlabs.map((slab, index) => {
      if (index === bidIncrementSlabs.length - 1) {
        return { ...slab, maxBid: newMinBid - 1 };
      }
      return slab;
    });

    // Add new slab
    const newSlab = {
      minBid: newMinBid,
      maxBid: null,
      increment: 100
    };

    setBidIncrementSlabs([...updatedSlabs, newSlab]);
  };

  // Remove a bid increment slab
  const removeBidSlab = (index: number) => {
    if (bidIncrementSlabs.length <= 1) return; // Keep at least one slab

    const updatedSlabs = bidIncrementSlabs.filter((_, i) => i !== index);

    // Make the last slab have no upper limit
    if (updatedSlabs.length > 0) {
      updatedSlabs[updatedSlabs.length - 1].maxBid = null;
    }

    setBidIncrementSlabs(updatedSlabs);
  };

  // Update a bid increment slab
  const updateBidSlab = (index: number, field: 'minBid' | 'maxBid' | 'increment', value: number | null) => {
    setBidIncrementSlabs(slabs =>
      slabs.map((slab, i) =>
        i === index ? { ...slab, [field]: value } : slab
      )
    );
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      navigate("/login");
    }
  }, [navigate]);



  // make fetchTeams callable so we can refresh after updates
  const fetchTeams = async () => {
    try {
      const tournamentId = getSelectedTournamentId();
      const response = await fetch(`${apiConfig.baseUrl}/api/team/all`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          touranmentId: tournamentId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch teams");
      }

      const data = await response.json();
      console.log("Fetched teams data:", data); // Debugging line
      const extractedTeams = data.data[0].teams.map((team) => ({
        _id: team._id || team.name, // Use team name as fallback if ID is missing
        name: team.name,
        logo: getDriveThumbnail(team.logo),
        remainingBudget: team.remainingBudget,
        playersCount: team.players.length,
        maxPlayersPerTeam: team.maxPlayersPerTeam,
        maxBiddableAmount: team.maxBiddableAmount || 0,
      }));
      setTeams(extractedTeams); // Update state with extracted team data
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  // Fetch all unsold players for manual search
  const fetchAllUnsoldPlayers = async () => {
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
      // Filter unsold players only
      const unsoldPlayers = data.data.filter(
        (player: Player) => !player.sold && !player.auctionStatus
      );
      setAllPlayers(unsoldPlayers);
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };

  // Handle manual player selection
  const handleManualPlayerSelect = (player: Player) => {
    setCurrentPlayer(player);
    setCurrentBid(player.basePrice || 0);
    const initialIncrement = getCurrentBidIncrement(player.basePrice || 0);
    setBidPrice(initialIncrement);
    setLeadingTeam(null);
    setLeadingTeamId(null);
    setTeamBids({});
    setBidHistory([]);
    setBidError({});
    setShowSearchDialog(false);
    setSearchTerm("");
    setCategoryFilter("All");
    setAuctionMode("manual");
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    const fetchPlayerCategories = async () => {
      try {
        const tournamentId = getSelectedTournamentId();
        const response = await fetch(`${apiConfig.baseUrl}/api/auction/player-categories`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            touranmentId: tournamentId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch player categories");
        }

        const data = await response.json();
        setPlayerCategories(data.data); // Update state with fetched categories

      } catch (error) {
        console.error("Error fetching player categories:", error);
      }
    };

    fetchPlayerCategories();
  }, []);

  useEffect(() => {
    if (!selectedCategory || auctionMode === "manual") return; // Do not fetch players until a category is selected or in manual mode

    const fetchNextPlayer = async () => {
      try {
        const tournamentId = getSelectedTournamentId();
        const response = await fetch(`${apiConfig.baseUrl}/api/auction/next-player`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            touranmentId: tournamentId,
            playerCategory: selectedCategory, // Pass selected category
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch next player for auction");
        }

        const data = await response.json();
        setCurrentPlayer(data.data); // Update to use API response structure
        setCurrentBid(data.data.basePrice);
        setBidHistory([]); // Clear bid history for new player
        console.log("Fetched player categories:", data.data); // Debugging line
        const initialIncrement = getCurrentBidIncrement(data.data.basePrice);
        setBidPrice(initialIncrement);
        setAuctionMode("category");
      } catch (error) {
        console.error("Error fetching next player for auction:", error);
      }
    };

    fetchNextPlayer();
  }, [selectedCategory, auctionMode, getCurrentBidIncrement]); // Refetch players when category changes

  const bidIncrement = 50;

  const handleTeamBid = (teamId: string) => {
    const team = teams.find(t => t._id === teamId);
    console.log("Bidding team:", currentBid);


    if (!team) {
      window.alert("Team not found");
      return;
    }

    const slotsRemaining = (team.maxPlayersPerTeam ?? 0) - (team.playersCount ?? 0);
    if (slotsRemaining <= 0) {
      window.alert(`${team.name} has no remaining slots.`);
      return;
    }

    // For the first bid, use currentBid as is. For subsequent bids, calculate increment first
    let newBid: number;
    let nextIncrement: number;

    if (leadingTeam === null) {
      // First bid - use base price
      newBid = currentBid;
      // Calculate increment for the next bid based on current bid
      nextIncrement = getCurrentBidIncrement(currentBid);
    } else {
      // Subsequent bids - add current increment to get new bid
      newBid = currentBid + bidPrice;
      // Calculate increment for the NEXT bid based on the NEW bid amount
      nextIncrement = getCurrentBidIncrement(newBid);
    }

    if ((team.remainingBudget ?? 0) < newBid) {
      window.alert(`${team.name} does not have enough remaining budget (${team.remainingBudget} Pts.).`);
      return;
    }

    // Check if team has enough maxBiddableAmount (considering future minimum player requirements)
    if ((team.maxBiddableAmount ?? 0) < newBid) {
      window.alert(`${team.name} cannot bid this amount. They need to reserve budget for minimum roster requirements. Max biddable: ${team.maxBiddableAmount} Pts.`);
      return;
    }

    // Add current state to history before making changes
    setBidHistory(prev => [...prev, { bid: currentBid, teamId: leadingTeam }]);

    setCurrentBid(newBid);
    setLeadingTeam(teamId);
    setLeadingTeamId(teamId);
    setTeamBids(prev => ({ ...prev, [teamId]: newBid }));

    // Set the increment for the next bid
    setBidPrice(nextIncrement);
  };

  const showBidError = (teamId: string, message: string) => {
    setBidError(prev => ({ ...prev, [teamId]: message }));
    setTimeout(() => {
      setBidError(prev => {
        const copy = { ...prev };
        delete copy[teamId];
        return copy;
      });
    }, 3000);
  };

  const handleUndoBid = () => {
    if (bidHistory.length === 0) return;

    // Get the last bid state from history
    const lastBidState = bidHistory[bidHistory.length - 1];

    // Revert to previous state
    setCurrentBid(lastBidState.bid);
    setLeadingTeam(lastBidState.teamId);
    setLeadingTeamId(lastBidState.teamId);

    // Recalculate increment based on the reverted bid
    const revertedIncrement = getCurrentBidIncrement(lastBidState.bid);
    setBidPrice(revertedIncrement);

    // Update team bids - remove the current leading team's bid or revert to previous
    if (leadingTeam) {
      if (lastBidState.teamId) {
        setTeamBids(prev => ({ ...prev, [lastBidState.teamId]: lastBidState.bid }));
      } else {
        setTeamBids(prev => {
          const copy = { ...prev };
          delete copy[leadingTeam];
          return copy;
        });
      }
    }

    // Remove the last entry from history
    setBidHistory(prev => prev.slice(0, -1));
  };

  const handleSold = async () => {
    if (leadingTeam && currentPlayer) {
      setShowCelebration(true);
      setTimeout(async () => {
        setShowCelebration(false);
        setLeadingTeam(null);
        setTeamBids({});
        setBidHistory([]); // Clear bid history for new player
        setPlayerNumber(prev => prev + 1); // Increment player number

        // Update auction result in the backend
        try {
          // Get user ID for authentication
          const userStr = localStorage.getItem("user");
          const user = userStr ? JSON.parse(userStr) : null;
          const userId = user?._id;

          if (!userId) {
            console.error("User not authenticated");
            return;
          }

          const updateResponse = await fetch(`${apiConfig.baseUrl}/api/player/update`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              playerId: currentPlayer._id,
              teamId: leadingTeam,
              sold: 1,
              auctionStatus: 1,
              amtSold: currentBid,
              userId
            }),
          });

          if (!updateResponse.ok) {
            throw new Error("Failed to update auction result");
          }
          // Refresh teams data so remainingBudget and players count update
          fetchTeams();
        } catch (error) {
          console.error("Error updating auction result:", error);
        }

        // Reset auction mode if in manual mode, otherwise fetch next player
        if (auctionMode === "manual") {
          setCurrentPlayer(null);
          setCurrentBid(0);
          setAuctionMode(null);
        } else {
          // Fetch the next player for auction in category mode
          try {
            const tournamentId = getSelectedTournamentId();
            const response = await fetch(`${apiConfig.baseUrl}/api/auction/next-player`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                touranmentId: tournamentId,
                playerCategory: selectedCategory,
              }),
            });

            if (!response.ok) {
              throw new Error("Failed to fetch next player for auction");
            }

            const data = await response.json();
            setCurrentPlayer(data.data);
            setCurrentBid(data.data.basePrice);
          } catch (error) {
            console.error("Error fetching next player for auction:", error);
          }
        }
      }, 4000);
    }
  };

  const handleUnsold = async () => {

    setShowUnsoldAnimation(true);
    setTimeout(async () => {
      setShowUnsoldAnimation(false);
      setLeadingTeam(null);
      setTeamBids({});
      setBidHistory([]); // Clear bid history for new player
      setPlayerNumber(prev => prev + 1); // Increment player number

      setLeadingTeam(null);
      setTeamBids({});
      setPlayerNumber(prev => prev + 1); // Increment player number

      try {
        // Get user ID for authentication
        const userStr = localStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;
        const userId = user?._id;

        if (!userId) {
          console.error("User not authenticated");
          return;
        }

        const updateResponse = await fetch(`${apiConfig.baseUrl}/api/player/update`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            playerId: currentPlayer._id,
            sold: 0,
            auctionStatus: 1,
            userId
          }),
        });

        if (!updateResponse.ok) {
          throw new Error("Failed to update auction result");
        }

        // Refresh teams data after marking unsold
        fetchTeams();
      } catch (error) {
        console.error("Error updating auction result:", error);
      }

      // Reset auction mode if in manual mode, otherwise fetch next player
      if (auctionMode === "manual") {
        setCurrentPlayer(null);
        setCurrentBid(0);
        setAuctionMode(null);
      } else {
        try {
          const tournamentId = getSelectedTournamentId();
          const response = await fetch(`${apiConfig.baseUrl}/api/auction/next-player`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              touranmentId: tournamentId,
              playerCategory: selectedCategory,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to fetch next player for auction");
          }

          const data = await response.json();
          setCurrentPlayer(data.data);
          setCurrentBid(data.data.basePrice);
        } catch (error) {
          console.error("Error fetching next player for auction:", error);
        }
      }
    }, 4000);
  };

  // Handle reset unsold players
  const handleResetUnsoldPlayers = async () => {
    setResetting(true);
    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      if (!user || !user._id) {
        toast({
          title: "Error",
          description: "Please login to perform this action",
          variant: "destructive",
        });
        return;
      }

      const tournamentId = getSelectedTournamentId();
      const response = await fetch(`${apiConfig.baseUrl}/api/player/reset-unsold`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          touranmentId: tournamentId,
          userId: user._id,
          userRole: user.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset unsold players");
      }

      toast({
        title: "Success",
        description: data.message || `${data.data?.count || 0} players reset successfully`,
      });

      setShowResetDialog(false);

      // Refresh players list if in manual mode
      if (auctionMode === "manual") {
        fetchAllUnsoldPlayers();
      }
    } catch (err) {
      console.error("Error resetting unsold players:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to reset unsold players",
        variant: "destructive",
      });
    } finally {
      setResetting(false);
    }
  };

  // Filter players based on search and category
  const filteredPlayers = allPlayers.filter((player) => {
    const matchesSearch = player.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || player.playerCategory === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Show mode selection screen if no mode is selected
  if (!auctionMode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Select Auction Mode
          </h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary w-80"
              onClick={() => setAuctionMode("category")}
            >
              <div className="flex flex-col items-center gap-4">
                <Shuffle className="h-16 w-16 text-primary" />
                <h3 className="text-xl font-bold">Category Based</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Select a category and get a random player for auction
                </p>
              </div>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary w-80"
              onClick={() => {
                setAuctionMode("manual");
                fetchAllUnsoldPlayers();
                setShowSearchDialog(true);
              }}
            >
              <div className="flex flex-col items-center gap-4">
                <Search className="h-16 w-16 text-primary" />
                <h3 className="text-xl font-bold">Manual Search</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Search and select a specific player for auction
                </p>
              </div>
            </Card>
          </div>

          {/* Reset Unsold Players Button */}
          <div className="mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResetDialog(true)}
              className="text-orange-500 border-orange-500 hover:bg-orange-500 hover:text-white"
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Reset Unsold Players
            </Button>
          </div>
        </div>

        {/* Reset Confirmation Dialog */}
        <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Unsold Players?</DialogTitle>
              <DialogDescription>
                This action will reset all unsold players back to available status, allowing them to be re-auctioned.
                <br />
                <br />
                <strong>Warning:</strong> This will affect all players marked as unsold in this tournament.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowResetDialog(false)}
                disabled={resetting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleResetUnsoldPlayers}
                disabled={resetting}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {resetting ? "Resetting..." : "Confirm Reset"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Show category selection screen for category mode
  if (auctionMode === "category" && !selectedCategory) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => {
              setAuctionMode(null);
            }}
            className="mb-6"
          >
            ← Back to Mode Selection
          </Button>
          <h2 className="text-2xl font-bold text-foreground mb-4">Select a Player Category to Start the Auction</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {playerCategories.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className="px-6 py-3 bg-primary text-white rounded-lg shadow-md hover:bg-primary-dark"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // If in manual mode without a player, show loading/search state
  if (!currentPlayer && auctionMode === "manual") {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => {
                setAuctionMode(null);
                setShowSearchDialog(false);
              }}
              className="mb-6"
            >
              ← Back to Mode Selection
            </Button>
            <h2 className="text-2xl font-bold text-foreground mb-4">Manual Player Search</h2>
            <Button
              onClick={() => {
                fetchAllUnsoldPlayers();
                setShowSearchDialog(true);
              }}
              size="lg"
              className="px-8"
            >
              <Search className="h-5 w-5 mr-2" />
              Search for Player
            </Button>
          </div>
        </div>

        {/* Manual Search Dialog */}
        <Dialog open={showSearchDialog} onOpenChange={setShowSearchDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Search Players</DialogTitle>
              <DialogDescription>
                Search and select a player to start their auction
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Search and Filter Controls */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search by Name</Label>
                  <Input
                    id="search"
                    placeholder="Enter player name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="w-48">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="All">All Categories</option>
                    {playerCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Players List */}
              <div className="overflow-y-auto max-h-96 space-y-2">
                {filteredPlayers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No players found matching your criteria
                  </p>
                ) : (
                  filteredPlayers.map((player) => (
                    <Card
                      key={player._id}
                      className="p-4 hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => handleManualPlayerSelect(player)}
                    >
                      <div className="flex items-center gap-4">
                        {player.photo && (
                          <img
                            src={getDriveThumbnail(player.photo)}
                            alt={player.name}
                            className="w-16 h-16 rounded-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(player.name) + '&size=200&background=random';
                            }}
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{player.name}</h3>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>Category: {player.playerCategory}</span>
                            <span>Base Price: {player.basePrice} Pts</span>
                          </div>
                        </div>
                        <Button size="sm">Select</Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  if (!currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <p className="text-xl text-muted-foreground">Loading next player for auction...</p>
      </div>
    );
  }


  return (
    <div className="min-h-screen relative">
      {/* Background: desktop and mobile optimized versions */}
      {/* Desktop background (shown on md+) */}
      <div
        className="hidden md:block fixed inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${stadiumBg})`, backgroundPosition: 'center center' }}
        aria-hidden
      />

      {/* Mobile background (shown on small screens) */}
      <div
        className="block md:hidden fixed inset-0 bg-cover bg-top opacity-20"
        style={{ backgroundImage: `url(${stadiumBg})`, backgroundPosition: 'top center', backgroundSize: 'cover' }}
        aria-hidden
      />

      {/* Gradient overlay to keep content readable */}
      {/* <div className="fixed inset-0 bg-gradient-dark" /> */}

      <div className="relative container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <div className="flex-1"></div>
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-card border-2 border-primary shadow-glow">
            <Gavel className="h-6 w-6 text-primary animate-glow-pulse" />
            <span className="text-xl font-bold text-foreground">Live Auction - Player #{playerNumber}</span>
          </div>
          <div className="flex-1 flex justify-end">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowSettingsDialog(true)}
              className="rounded-full"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="space-y-8 max-w-full mx-auto">
          {/* Large Player Card */}
          <div className="flex justify-center animate-scale-in">
            <div className="w-full max-w-7xl h-[60vh]">
              <AuctionPlayerCard
                player={currentPlayer}
                isAnimated
                className="w-full h-full"
                currentBid={currentBid}
                leadingTeamName={teams.find(t => t._id === leadingTeam)?.name}
                leadingTeamLogo={teams.find(t => t._id === leadingTeam)?.logo}
                bidPrice={bidPrice}
              />
            </div>
          </div>

          {/* Team Bidding Grid */}
          <Card className="p-3 bg-card/80 backdrop-blur-sm border-2 border-border shadow-elevated max-w-5xl mx-auto">
            <h2 className="text-lg font-bold mb-3 text-foreground text-center">Click on Team to Bid</h2>

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-3">
              {teams.map((team) => {
                // Calculate the next bid amount
                const nextBidAmount = leadingTeam === null ? currentBid : currentBid + bidPrice;

                // Check various disable conditions
                const noSlots = (team.maxPlayersPerTeam ?? 0) - (team.playersCount ?? 0) <= 0;
                const insufficientBudget = (team.remainingBudget ?? 0) < nextBidAmount;
                const exceedsMaxBiddable = (team.maxBiddableAmount ?? 0) < nextBidAmount;

                const isDisabled = noSlots || insufficientBudget || exceedsMaxBiddable;

                return (
                  <div key={team._id} className="flex flex-col items-center">
                    <div
                      onClick={() => {
                        if (isDisabled) {
                          // show appropriate message
                          if (noSlots) {
                            showBidError(team._id, `${team.name} has no remaining slots.`);
                          } else if (exceedsMaxBiddable) {
                            showBidError(team._id, `${team.name} must reserve budget for minimum roster. Max bid: ${team.maxBiddableAmount} Pts.`);
                          } else {
                            showBidError(team._id, `${team.name} does not have enough remaining budget (Pts. ${team.remainingBudget}).`);
                          }
                          return;
                        }
                        handleTeamBid(team._id);
                      }}
                      className="w-full"
                    >
                      <button
                        // keep native disabled so it appears disabled
                        disabled={isDisabled}
                        className={`w-full p-2 rounded-lg border-2 transition-all ${isDisabled
                          ? "border-red-500 bg-red-500/20 opacity-60 cursor-not-allowed"
                          : leadingTeam === team._id
                            ? "border-primary bg-primary/20 shadow-glow scale-105"
                            : "border-border hover:border-primary/50 hover:scale-105"
                          }`}
                      >
                        <div className="text-2xl mb-1">
                          <img src={team.logo} alt={team.name} className="h-8 w-8 object-contain mx-auto" />
                        </div>
                        <p className="font-bold text-[10px] text-foreground mb-0.5 text-center">{team.name}</p>
                        <div className="text-[10px] text-muted-foreground text-center">
                          {team.remainingBudget} Pts. • {team.maxPlayersPerTeam - team.playersCount} slots
                        </div>
                        {teamBids[team._id] && (
                          <p className="text-[9px] text-primary font-bold mt-1 text-center">
                            {teamBids[team._id]} Pts.
                          </p>
                        )}
                      </button>
                    </div>
                    {bidError[team._id] && (
                      <p className="text-red-500 text-xs mt-1">{bidError[team._id]}</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 justify-center flex-wrap">
              {auctionMode === "manual" && (
                <Button
                  onClick={() => {
                    fetchAllUnsoldPlayers();
                    setShowSearchDialog(true);
                  }}
                  variant="secondary"
                  size="default"
                  className="px-6"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search Another
                </Button>
              )}
              <Button
                onClick={handleUndoBid}
                disabled={bidHistory.length === 0}
                variant="secondary"
                size="default"
                className="px-6"
              >
                Undo Bid
              </Button>
              <Button
                onClick={handleUnsold}
                variant="outline"
                size="default"
                className="px-8"
              >
                Unsold
              </Button>
              <Button
                onClick={handleSold}
                disabled={!leadingTeam}
                size="default"
                className="px-8 bg-gradient-accent hover:opacity-90"
              >
                Sold!
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Celebration */}
      <SoldCelebration
        show={showCelebration}
        playerName={currentPlayer.name}
        teamName={teams.find(t => t._id === leadingTeam)?.name || ""}
        amount={currentBid}
      />

      <UnsoldAnimation
        show={showUnsoldAnimation}
        playerName={currentPlayer.name}
      />

      {/* Manual Search Dialog */}
      <Dialog open={showSearchDialog} onOpenChange={setShowSearchDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Search Players</DialogTitle>
            <DialogDescription>
              Search and select a player to start their auction
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search and Filter Controls */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search by Name</Label>
                <Input
                  id="search"
                  placeholder="Enter player name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-48">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="All">All Categories</option>
                  {playerCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Players List */}
            <div className="overflow-y-auto max-h-96 space-y-2">
              {filteredPlayers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No players found matching your criteria
                </p>
              ) : (
                filteredPlayers.map((player) => (
                  <Card
                    key={player._id}
                    className="p-4 hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => handleManualPlayerSelect(player)}
                  >
                    <div className="flex items-center gap-4">
                      {player.photo && (
                        <img
                          src={getDriveThumbnail(player.photo)}
                          alt={player.name}
                          className="w-16 h-16 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(player.name) + '&size=200&background=random';
                          }}
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{player.name}</h3>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>Category: {player.playerCategory}</span>
                          <span>Base Price: {player.basePrice} Pts</span>
                        </div>
                      </div>
                      <Button size="sm">Select</Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bid Increment Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Bid Increment Settings</DialogTitle>
            <DialogDescription>
              Configure bid increment amounts based on different bid ranges
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto">
            {bidIncrementSlabs.map((slab, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor={`minBid-${index}`}>Min Bid</Label>
                      <Input
                        id={`minBid-${index}`}
                        type="number"
                        value={slab.minBid}
                        onChange={(e) => updateBidSlab(index, 'minBid', parseInt(e.target.value) || 0)}
                        disabled={index > 0} // Only first slab can have minBid 0
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`maxBid-${index}`}>Max Bid</Label>
                      <Input
                        id={`maxBid-${index}`}
                        type="number"
                        value={slab.maxBid ?? ''}
                        onChange={(e) => updateBidSlab(index, 'maxBid', e.target.value ? parseInt(e.target.value) : null)}
                        placeholder={index === bidIncrementSlabs.length - 1 ? 'No limit' : ''}
                        disabled={index === bidIncrementSlabs.length - 1}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`increment-${index}`}>Increment</Label>
                      <Input
                        id={`increment-${index}`}
                        type="number"
                        value={slab.increment}
                        onChange={(e) => updateBidSlab(index, 'increment', parseInt(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {bidIncrementSlabs.length > 1 && (
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeBidSlab(index)}
                      className="mt-6"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="mt-2 text-sm text-muted-foreground">
                  {slab.maxBid !== null
                    ? `Bids from ${slab.minBid} to ${slab.maxBid} will increment by ${slab.increment}`
                    : `Bids from ${slab.minBid} and above will increment by ${slab.increment}`
                  }
                </div>
              </Card>
            ))}

            <Button
              onClick={addBidSlab}
              variant="outline"
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Slab
            </Button>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-2">Preview</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                {bidIncrementSlabs.sort((a, b) => a.minBid - b.minBid).map((slab, index) => (
                  <div key={index}>
                    • {slab.maxBid !== null
                      ? `₹${slab.minBid} - ₹${slab.maxBid}: +${slab.increment}`
                      : `₹${slab.minBid}+: +${slab.increment}`
                    }
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={() => setShowSettingsDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const tournamentId = getSelectedTournamentId();
                    const user = JSON.parse(localStorage.getItem("user") || "{}");

                    const response = await fetch(`${apiConfig.baseUrl}/api/tournament/update`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        tournamentId: tournamentId,
                        bidIncrementSlabs: bidIncrementSlabs,
                        userId: user._id,
                        userRole: user.role,
                      }),
                    });

                    if (!response.ok) {
                      throw new Error("Failed to update bid settings");
                    }

                    alert("Bid increment settings saved successfully!");
                    setShowSettingsDialog(false);
                  } catch (error) {
                    console.error("Error saving bid settings:", error);
                    alert("Failed to save bid settings. Please try again.");
                  }
                }}
                className="flex-1"
              >
                Save Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auction;
