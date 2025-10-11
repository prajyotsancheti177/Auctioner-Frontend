import { useState, useEffect } from "react";
import { PlayerCard } from "@/components/auction/PlayerCard";
import { SoldCelebration } from "@/components/auction/SoldCelebration";
import { UnsoldAnimation } from "@/components/auction/UnsoldAnimation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Gavel } from "lucide-react";
import stadiumBg from "@/assets/stadium-bg.jpg";
import placeholderImg from "@/assets/player-placeholder.jpg";
import { useNavigate } from "react-router-dom";
import { set } from "date-fns";



// Helper: convert common Google Drive share URLs to thumbnail format
const getDriveThumbnail = (url?: string) => {
  if (!url) return placeholderImg;
  try {
    const driveFileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (driveFileIdMatch && driveFileIdMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${driveFileIdMatch[1]}`;
    }
    const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idParamMatch && idParamMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${idParamMatch[1]}`;
    }
    // if it's already a direct image or thumbnail URL, return as-is
    return url;
  } catch (e) {
    return placeholderImg;
  }
};


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

  const navigate = useNavigate();

   useEffect(() => {
    const password = localStorage.getItem("auction-password");
    if (password !== "pushkar_champion") {
      navigate("/"); // 👈 redirect if password doesn't match
    }

  }, [navigate]);

 

  // make fetchTeams callable so we can refresh after updates
  const fetchTeams = async () => {
    try {
      const response = await fetch("https://auction.vardhamanpaper.com/api/team/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          touranmentId: "671b0a000000000000000001",
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
      }));
      setTeams(extractedTeams); // Update state with extracted team data
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    const fetchPlayerCategories = async () => {
      try {
        const response = await fetch("https://auction.vardhamanpaper.com/api/auction/playerCategories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            touranmentId: "671b0a000000000000000001",
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
    if (!selectedCategory) return; // Do not fetch players until a category is selected

    const fetchNextPlayer = async () => {
      try {
        const response = await fetch("https://auction.vardhamanpaper.com/api/player/nextAuctionPlayer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            touranmentId: "671b0a000000000000000001",
            playerCategory: selectedCategory, // Pass selected category
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch next player for auction");
        }

        const data = await response.json();
        setCurrentPlayer(data.data); // Update to use API response structure
        setCurrentBid(data.data.basePrice);
         console.log("Fetched player categories:", data.data); // Debugging line
        setBidPrice(data.data.playerCategory=="Icon"?100:50);
      } catch (error) {
        console.error("Error fetching next player for auction:", error);
      }
    };

    fetchNextPlayer();
  }, [selectedCategory]); // Refetch players when category changes

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

    const newBid = leadingTeam ==null ? currentBid : currentBid + bidPrice;
    if ((team.remainingBudget ?? 0) < newBid) {
      window.alert(`${team.name} does not have enough remaining budget (₹${team.remainingBudget}).`);
      return;
    }

      if(currentPlayer.playerCategory!="Icon" && newBid>=  500){
        setBidPrice(100);
    }

    setCurrentBid(newBid);
    setLeadingTeam(teamId);
    setLeadingTeamId(teamId);
    setTeamBids(prev => ({ ...prev, [teamId]: newBid }));
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

  const handleSold = async () => {
    if (leadingTeam && currentPlayer) {
      setShowCelebration(true);
      setTimeout(async () => {
        setShowCelebration(false);
        setLeadingTeam(null);
        setTeamBids({});
        setPlayerNumber(prev => prev + 1); // Increment player number

        // Update auction result in the backend
        try {
          const updateResponse = await fetch("https://auction.vardhamanpaper.com/api/player/updatePlayer", {
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

        // Fetch the next player for auction
        try {
          const response = await fetch("https://auction.vardhamanpaper.com/api/player/nextAuctionPlayer", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              touranmentId: "671b0a000000000000000001",
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
      }, 4000);
    }
  };

  const handleUnsold = async () => {

    setShowUnsoldAnimation(true);
    setTimeout(async () => {
      setShowUnsoldAnimation(false);
      setLeadingTeam(null);
      setTeamBids({});
      setPlayerNumber(prev => prev + 1); // Increment player number

    setLeadingTeam(null);
    setTeamBids({});
    setPlayerNumber(prev => prev + 1); // Increment player number

    try {
      const updateResponse = await fetch("https://auction.vardhamanpaper.com/api/player/updatePlayer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerId: currentPlayer._id,
          sold: 0,
          auctionStatus: 1
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

    try {
      const response = await fetch("https://auction.vardhamanpaper.com/api/player/nextAuctionPlayer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          touranmentId: "671b0a000000000000000001",
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
  }, 4000);
  };

  if (!selectedCategory) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-dark">
        <div className="text-center">
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
  
  if (!currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-dark">
        <p className="text-xl text-muted-foreground">Loading next player for auction...</p>
      </div>
    );
  }


  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${stadiumBg})` }}
      />
      <div className="fixed inset-0 bg-gradient-dark" />

      <div className="relative container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-card border-2 border-primary shadow-glow">
            <Gavel className="h-6 w-6 text-primary animate-glow-pulse" />
            <span className="text-xl font-bold text-foreground">Live Auction - Player #{playerNumber}</span>
          </div>

          <div className="text-right">
            <div className="text-8xl font-black text-secondary mb-2">
              ₹{currentBid}
            </div>
            {leadingTeam && (
              <div className="text-4xl font-black text-primary mb-1">
                {teams.find(t => t._id === leadingTeam)?.name}
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Base: ₹{currentPlayer.basePrice} | Increment: ₹{bidPrice}
            </p>
          </div>
        </div>

        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Large Player Card */}
          <div className="flex justify-center animate-scale-in">
            <PlayerCard player={currentPlayer} isAnimated className="max-w-4xl w-full" />
          </div>

          {/* Team Bidding Grid */}
          <Card className="p-3 bg-card/80 backdrop-blur-sm border-2 border-border shadow-elevated max-w-3xl mx-auto">
            <h2 className="text-lg font-bold mb-3 text-foreground text-center">Click on Team to Bid</h2>

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-3">
              {teams.map((team) => {
                const isDisabled = ((team.maxPlayersPerTeam ?? 0) - (team.playersCount ?? 0) <= 0) || ((team.remainingBudget ?? 0) < (currentBid + bidPrice));
                return (
                  <div key={team._id} className="flex flex-col items-center">
                    <div
                      onClick={() => {
                        if (isDisabled) {
                          // show appropriate message
                          if ((team.maxPlayersPerTeam ?? 0) - (team.playersCount ?? 0) <= 0) {
                            showBidError(team._id, `${team.name} has no remaining slots.`);
                          } else {
                            showBidError(team._id, `${team.name} does not have enough remaining budget (₹${team.remainingBudget}).`);
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
                        className={`w-full p-2 rounded-lg border-2 transition-all ${leadingTeam === team._id
                          ? "border-primary bg-primary/20 shadow-glow scale-105"
                          : "border-border hover:border-primary/50 hover:scale-105"
                        }`}
                      >
                        <div className="text-2xl mb-1">
                          <img src={team.logo} alt={team.name} className="h-8 w-8 object-contain mx-auto" />
                        </div>
                        <p className="font-bold text-[10px] text-foreground mb-0.5 text-center">{team.name}</p>
                        <div className="text-[10px] text-muted-foreground text-center">
                          ₹{team.remainingBudget} • {team.maxPlayersPerTeam - team.playersCount} slots
                        </div>
                        {teamBids[team._id] && (
                          <p className="text-[9px] text-primary font-bold mt-1 text-center">
                            ₹{(teamBids[team._id] / 100000).toFixed(1)}L
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

            <div className="flex gap-3 justify-center">
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
        teamName={teams.find(t => t._id === leadingTeam)?.name || ""}
        amount={currentBid}
      />      
    </div>
  );
};

export default Auction;
