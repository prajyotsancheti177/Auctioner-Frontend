import { useState, useEffect, useCallback } from "react";
import { AuctionPlayerCard } from "@/components/auction/AuctionPlayerCard";
import { SoldCelebration } from "@/components/auction/SoldCelebration";
import { UnsoldAnimation } from "@/components/auction/UnsoldAnimation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Gavel, Search, Settings, Plus, Trash2, Volume2, VolumeX, Sparkles } from "lucide-react";
import stadiumBg from "@/assets/stadium-bg.jpg";
import logo from "@/assets/logo.png";
import { useNavigate, useParams } from "react-router-dom";
import { Player } from "@/types/auction";
import apiConfig from "@/config/apiConfig";
import { getDriveThumbnail } from "@/lib/imageUtils";
import { getSelectedTournamentId } from "@/lib/tournamentUtils";
import { useToast } from "@/hooks/use-toast";
import { trackPageView } from "@/lib/eventTracker";
import { useAuctionSocket } from "@/hooks/useAuctionSocket";

const Auction = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tournamentId } = useParams<{ tournamentId: string }>();

  // Auth & Context
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  // const tournamentId = getSelectedTournamentId(); // Legacy usage replaced by params

  // Redirect if not logged in (viewers might be allowed but we check user object validity)
  // Plan said "Anyone with the link", so we shouldn't force login for viewers.
  // But we need user ID for auctioneer actions.
  // If no user, we just don't pass userID to hook.

  const {
    socket,
    isConnected,
    auctionState,
    isAuctioneer,
    actions
  } = useAuctionSocket(tournamentId || undefined, user?._id);

  // Derived State
  const currentPlayer = auctionState?.currentPlayer || null;
  const currentBid = auctionState?.currentBid || 0;
  const leadingTeam = auctionState?.leadingTeam || null;
  // Use teams from auctionState if available, otherwise empty. 
  // We don't fetch teams locally anymore as they come from socket state for budget syncing.
  const teams = auctionState?.teams || [];

  const bidPrice = auctionState?.bidPrice || 100;
  const playerNumber = auctionState?.playerNumber || 1;
  const teamBids = auctionState?.teamBids || {};
  const auctionMode = auctionState?.auctionMode || null;

  // UI State
  const [showCelebration, setShowCelebration] = useState(false);
  const [showUnsoldAnimation, setShowUnsoldAnimation] = useState(false);

  // Captured values for animations to prevent desync when state updates
  const [soldInfo, setSoldInfo] = useState<{ playerName: string; teamName: string; amount: number } | null>(null);
  const [unsoldPlayerName, setUnsoldPlayerName] = useState<string>("");

  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [playerCategories, setPlayerCategories] = useState<string[]>([]);

  // Settings State
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  // We still load initial slabs for the settings dialog
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

  // Sound and animation settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [animationEnabled, setAnimationEnabled] = useState(true);

  // Fetch tournament data including bid increment slabs
  useEffect(() => {
    if (tournamentId) {
      trackPageView("/auction", tournamentId);
    }
  }, [tournamentId]);

  // Listener for specific events to trigger animations
  useEffect(() => {
    if (!socket) return;

    const onSold = (data: { player: { name: string }; team: { name: string }; amount: number }) => {
      // Capture the sold info at the moment of the event
      setSoldInfo({
        playerName: data.player?.name || currentPlayer?.name || "",
        teamName: data.team?.name || teams.find(t => t._id === leadingTeam)?.name || "",
        amount: data.amount || currentBid
      });
      setShowCelebration(true);
      // Auto-hide handled by component or timeout
      setTimeout(() => {
        setShowCelebration(false);
        setSoldInfo(null);
      }, 4000);
    };

    const onUnsold = () => {
      // Capture the player name at the moment of the event
      setUnsoldPlayerName(currentPlayer?.name || "");
      setShowUnsoldAnimation(true);
      setTimeout(() => {
        setShowUnsoldAnimation(false);
        setUnsoldPlayerName("");
      }, 4000);
    };

    socket.on("auction:sold", onSold);
    socket.on("auction:unsold", onUnsold);

    return () => {
      socket.off("auction:sold", onSold);
      socket.off("auction:unsold", onUnsold);
    };
  }, [socket, currentPlayer, currentBid, leadingTeam, teams]);

  // Fetch initial data for manual search and settings
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!tournamentId) return;
      try {
        // Categories
        const catRes = await fetch(`${apiConfig.baseUrl}/api/auction/player-categories`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ touranmentId: tournamentId }),
        });
        const catData = await catRes.json();
        if (catData?.data) setPlayerCategories(catData.data);

        // Slabs (from tournament detail)
        const tournRes = await fetch(`${apiConfig.baseUrl}/api/tournament/detail`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tournamentId }),
        });
        const tournData = await tournRes.json();
        if (tournData?.data?.bidIncrementSlabs) {
          setBidIncrementSlabs(tournData.data.bidIncrementSlabs);
        } else {
          setBidIncrementSlabs([
            { minBid: 0, maxBid: 499, increment: 50 },
            { minBid: 500, maxBid: null, increment: 100 }
          ]);
        }

      } catch (err) {
        console.error("Error fetching initial data", err);
      }
    };
    fetchInitialData();
  }, [tournamentId]);

  // Fetch unsold players only when dialog opens
  useEffect(() => {
    if (showSearchDialog && tournamentId) {
      const fetchPlayers = async () => {
        try {
          const response = await fetch(`${apiConfig.baseUrl}/api/player/all`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ touranmentId: tournamentId }),
          });
          const data = await response.json();
          if (data?.data) {
            const unsold = data.data.filter((p: Player) => !p.sold && !p.auctionStatus);
            setAllPlayers(unsold);
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchPlayers();
    }
  }, [showSearchDialog, tournamentId]);

  // Helpers
  const filteredPlayers = allPlayers.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || p.playerCategory === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Action Handlers
  const handleStartAuction = () => {
    actions.startAuction();
  };

  const handleNextPlayer = () => {
    // If we have a current category filter selected in state (though local state is tricky here if we rely on global)
    // We should probably have a UI to select category before picking next player.
    // For now, allow picking from "All" or randomly if no category set in UI?
    // Let's assume we want to pick from "All" unless defined.
    // Ideally, we should add a category selector for the auctioneer.
    // For simplicity, let's just pick 'All' or a default.
    actions.selectPlayer(undefined, "All");
  };

  const handleManualSelect = (player: Player) => {
    actions.selectPlayer(player._id);
    setShowSearchDialog(false);
  };

  const [bidError, setBidError] = useState<Record<string, string>>({});
  const showBidError = (teamId: string, msg: string) => {
    setBidError(prev => ({ ...prev, [teamId]: msg }));
    setTimeout(() => setBidError(prev => {
      const copy = { ...prev };
      delete copy[teamId];
      return copy;
    }), 3000);
  };

  // Settings Logic
  const updateBidSlab = (index: number, field: any, value: any) => {
    setBidIncrementSlabs(slabs => slabs.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };
  const addBidSlab = () => {
    const last = bidIncrementSlabs[bidIncrementSlabs.length - 1];
    const newMin = last.maxBid ? last.maxBid + 1 : last.minBid + 500;
    setBidIncrementSlabs(prev => {
      const updated = [...prev];
      updated[updated.length - 1] = { ...updated[updated.length - 1], maxBid: newMin - 1 };
      return [...updated, { minBid: newMin, maxBid: null, increment: 100 }];
    });
  };
  const removeBidSlab = (index: number) => {
    if (bidIncrementSlabs.length <= 1) return;
    const filtered = bidIncrementSlabs.filter((_, i) => i !== index);
    if (filtered.length > 0) filtered[filtered.length - 1].maxBid = null;
    setBidIncrementSlabs(filtered);
  };
  const saveSettings = async () => {
    try {
      if (!user || !tournamentId) return;
      const response = await fetch(`${apiConfig.baseUrl}/api/tournament/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournamentId,
          bidIncrementSlabs,
          userId: user._id,
          userRole: user.role
        })
      });
      if (response.ok) {
        alert("Settings saved. You may need to restart the auction for changes to take effect.");
        setShowSettingsDialog(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Loading / Connection States
  if (!isConnected && !auctionState) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Connecting to Live Auction...</h2>
          <p className="text-muted-foreground">Please wait while we establish connection.</p>
        </div>
      </div>
    );
  }

  // Not Active State (or Active but no Mode selected)
  if (auctionState && (!auctionState.isActive || !auctionMode) && !currentPlayer) {
    return (
      <div className="relative min-h-screen bg-background flex flex-col items-center justify-center p-4">
        {/* Background */}
        <div className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none" style={{ backgroundImage: `url(${stadiumBg})` }} />

        <div className="z-10 text-center max-w-md space-y-6 p-8 rounded-xl bg-card border shadow-lg animate-fade-in">
          <Gavel className="w-16 h-16 mx-auto text-primary mb-4" />
          <h1 className="text-3xl font-bold">Live Auction</h1>
          <p className="text-muted-foreground">
            {isAuctioneer
              ? "You are connected as the auctioneer."
              : "Waiting for the auctioneer to start the session."}
          </p>

          {!isAuctioneer && user && (
            <Button onClick={handleStartAuction} size="lg" className="w-full">
              Start Auction as Host
            </Button>
          )}

          {isAuctioneer && (
            <div className="space-y-4">
              <Button onClick={handleNextPlayer} size="lg" className="w-full">
                Start with Next Player
              </Button>
              <Button onClick={() => setShowSearchDialog(true)} variant="outline" className="w-full">
                Select Player Manually
              </Button>
            </div>
          )}

          {!user && (
            <div className="text-sm text-yellow-600 bg-yellow-100 p-3 rounded">
              You are in viewer mode. Log in to host.
            </div>
          )}
        </div>

        {/* Manual Search Dialog (Available here too for initial start) */}
        <Dialog open={showSearchDialog} onOpenChange={setShowSearchDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Select First Player</DialogTitle>
            </DialogHeader>
            {/* Reuse Search UI */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <select className="border rounded px-3" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                  <option value="All">All Categories</option>
                  {playerCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="overflow-y-auto max-h-96 space-y-2">
                {filteredPlayers.map(player => (
                  <Card key={player._id} className="p-4 cursor-pointer hover:bg-accent" onClick={() => handleManualSelect(player)}>
                    <div className="flex items-center gap-4">
                      {player.photo && <img src={getDriveThumbnail(player.photo)} className="w-12 h-12 rounded-full object-cover" />}
                      <div>
                        <div className="font-bold">{player.name}</div>
                        <div className="text-sm text-muted-foreground">{player.playerCategory}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Active Auction Render
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans selection:bg-primary/20">
      {/* Backgrounds */}
      <div
        className="fixed inset-0 bg-cover bg-center opacity-5 pointer-events-none hidden md:block"
        style={{ backgroundImage: `url(${stadiumBg})` }}
        aria-hidden
      />
      <div
        className="block md:hidden fixed inset-0 bg-cover bg-top opacity-20 pointer-events-none"
        style={{ backgroundImage: `url(${stadiumBg})`, backgroundPosition: 'top center', backgroundSize: 'cover' }}
        aria-hidden
      />

      <div className="relative container mx-auto px-2 py-4 md:px-4 md:py-8">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-4 md:mb-8 gap-2 animate-fade-in">
          <div className="flex-1">
            {!isAuctioneer && (
              <div className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-bold">
                  Viewer Mode
                </span>
                {user && (
                  <Button
                    onClick={handleStartAuction}
                    size="sm"
                    variant="outline"
                    className="ml-2 border-primary text-primary hover:bg-primary/10"
                  >
                    Resume Hosting
                  </Button>
                )}
              </div>
            )}
          </div>
          <div className="inline-flex items-center gap-2 md:gap-3 px-3 md:px-6 py-2 md:py-3 rounded-full bg-card border-2 border-primary shadow-glow">
            <div className="bg-white px-1 md:px-2 py-0.5 rounded-md overflow-hidden flex items-center justify-center">
              <img src={logo} alt="Logo" className="h-8 md:h-12 w-auto object-contain scale-[1.35]" />
            </div>
            <span className="text-sm md:text-xl font-bold text-foreground">
              Player #{currentPlayer?.auctionSerialNumber || playerNumber}
            </span>
          </div>
          <div className="flex justify-end gap-1 md:gap-2">
            {/* Sound Toggle */}
            <Button
              variant={soundEnabled ? "default" : "outline"}
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="rounded-full"
              title={soundEnabled ? "Sound On" : "Sound Off"}
            >
              {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>
            {/* Animation Toggle - Auctioneer only */}
            {isAuctioneer && (
              <Button
                variant={animationEnabled ? "default" : "outline"}
                size="icon"
                onClick={() => setAnimationEnabled(!animationEnabled)}
                className="rounded-full"
                title={animationEnabled ? "Animations On" : "Animations Off"}
              >
                <Sparkles className={`h-5 w-5 ${!animationEnabled ? 'opacity-50' : ''}`} />
              </Button>
            )}
            {/* Settings */}
            {/* Only Auctioneer can change settings? Maybe anyone for now if allowed */}
            {isAuctioneer && (
              <Button variant="outline" size="icon" onClick={() => setShowSettingsDialog(true)} className="rounded-full">
                <Settings className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4 md:space-y-8 max-w-full mx-auto">
          {/* Large Player Card */}
          <div className="flex justify-center animate-scale-in">
            <div className="w-full max-w-7xl min-h-[50vh] md:min-h-[55vh]">
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

          {/* Team Bidding Grid - Only for Auctioneer */}
          {isAuctioneer && (
            <Card className="p-2 md:p-3 bg-card/80 backdrop-blur-sm border-2 border-border shadow-elevated max-w-5xl mx-auto">
              <h2 className="text-sm md:text-lg font-bold mb-2 md:mb-3 text-foreground text-center">
                Click on Team to Bid
              </h2>

              <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-1 md:gap-2 mb-2 md:mb-3">
                {teams.map((team: any) => {
                  const nextBidAmount = leadingTeam === null ? currentBid : currentBid + bidPrice;
                  const noSlots = (team.maxPlayersPerTeam ?? 0) - (team.playersCount ?? 0) <= 0;
                  const insufficientBudget = (team.remainingBudget ?? 0) < nextBidAmount;
                  const exceedsMaxBiddable = (team.maxBiddableAmount ?? 0) < nextBidAmount;
                  const isDisabled = (noSlots || insufficientBudget || exceedsMaxBiddable);

                  return (
                    <div key={team._id} className="flex flex-col items-center">
                      <div
                        onClick={() => {
                          if (isDisabled) {
                            if (noSlots) showBidError(team._id, "No remaining slots");
                            else if (exceedsMaxBiddable) showBidError(team._id, "Exceeds max biddable");
                            else showBidError(team._id, "Insufficient budget");
                            return;
                          }
                          actions.placeBid(team._id);
                        }}
                        className="w-full"
                      >
                        <button
                          disabled={isDisabled}
                          className={`w-full p-2 rounded-lg border-2 transition-all ${isDisabled ? "border-red-500 bg-red-500/20 opacity-60 cursor-not-allowed" :
                            leadingTeam === team._id ? "border-primary bg-primary/20 shadow-glow scale-105" :
                              "border-border hover:border-primary/50 hover:scale-105"
                            }`}
                        >
                          <div className="text-2xl mb-1">
                            <img src={team.logo || 'placeholder.png'} alt={team.name} className="h-8 w-8 object-contain mx-auto" />
                          </div>
                          <p className="font-bold text-[10px] text-foreground mb-0.5 text-center truncate">{team.name}</p>
                          <div className="text-[10px] text-muted-foreground text-center">
                            {team.remainingBudget} Pts • {(team.maxPlayersPerTeam || 0) - (team.playersCount || 0)} slots
                          </div>
                          {teamBids[team._id] && (
                            <p className="text-[9px] text-primary font-bold mt-1 text-center">{teamBids[team._id]} Pts.</p>
                          )}
                        </button>
                      </div>
                      {bidError[team._id] && <p className="text-red-500 text-xs mt-1 text-center">{bidError[team._id]}</p>}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2 md:gap-3 justify-center flex-wrap">
                <Button onClick={handleNextPlayer} size="sm" className="px-3 md:px-6 text-xs md:text-sm bg-primary text-primary-foreground hover:bg-primary/90">
                  Next
                </Button>
                <Button onClick={() => { setShowSearchDialog(true); }} variant="secondary" size="sm" className="px-3 md:px-6 text-xs md:text-sm">
                  <Search className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" /> Search
                </Button>
                <Button onClick={actions.undoBid} disabled={currentBid === 0 || !currentPlayer} variant="secondary" size="sm" className="px-3 md:px-6 text-xs md:text-sm">
                  Undo
                </Button>
                <Button onClick={actions.markUnsold} disabled={!currentPlayer} variant="outline" size="sm" className="px-4 md:px-8 text-xs md:text-sm">
                  Unsold
                </Button>
                <Button onClick={actions.markSold} disabled={!leadingTeam || !currentPlayer} size="sm" className="px-4 md:px-8 text-xs md:text-sm bg-gradient-accent hover:opacity-90">
                  Sold!
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Celebration & Animation */}
      <SoldCelebration
        show={showCelebration}
        playerName={soldInfo?.playerName || ""}
        teamName={soldInfo?.teamName || ""}
        amount={soldInfo?.amount || 0}
        soundEnabled={soundEnabled}
        animationEnabled={animationEnabled}
      />

      <UnsoldAnimation
        show={showUnsoldAnimation}
        playerName={unsoldPlayerName}
        soundEnabled={soundEnabled}
        animationEnabled={animationEnabled}
      />

      {/* Manual Search Dialog */}
      <Dialog open={showSearchDialog} onOpenChange={setShowSearchDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Search Players</DialogTitle>
            <DialogDescription>Select a player to auction</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search by Name</Label>
                <Input id="search" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <div className="w-48">
                <Label htmlFor="category">Category</Label>
                <select id="category" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background">
                  <option value="All">All Categories</option>
                  {playerCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="overflow-y-auto max-h-96 space-y-2">
              {filteredPlayers.length === 0 ? <p className="text-center py-8">No players found</p> :
                filteredPlayers.map(player => (
                  <Card key={player._id} className="p-4 hover:bg-accent cursor-pointer" onClick={() => handleManualSelect(player)}>
                    <div className="flex items-center gap-4">
                      {player.photo && (
                        <img src={getDriveThumbnail(player.photo)} className="w-16 h-16 rounded-full object-cover" />
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
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader><DialogTitle>Settings</DialogTitle></DialogHeader>
          <div className="space-y-4 overflow-y-auto">
            {bidIncrementSlabs.map((slab, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    <div><Label>Min Bid</Label><Input type="number" value={slab.minBid} onChange={e => updateBidSlab(index, 'minBid', +e.target.value)} disabled={index > 0} /></div>
                    <div><Label>Max Bid</Label><Input type="number" value={slab.maxBid ?? ''} onChange={e => updateBidSlab(index, 'maxBid', e.target.value ? +e.target.value : null)} disabled={index === bidIncrementSlabs.length - 1} /></div>
                    <div><Label>Increment</Label><Input type="number" value={slab.increment} onChange={e => updateBidSlab(index, 'increment', +e.target.value)} /></div>
                  </div>
                  {bidIncrementSlabs.length > 1 && <Button variant="destructive" size="icon" onClick={() => removeBidSlab(index)}><Trash2 className="h-4 w-4" /></Button>}
                </div>
              </Card>
            ))}
            <Button onClick={addBidSlab} variant="outline" className="w-full"><Plus className="mr-2 h-4 w-4" /> Add Slab</Button>
            <div className="flex gap-2">
              <Button onClick={() => setShowSettingsDialog(false)} variant="outline" className="flex-1">Cancel</Button>
              <Button onClick={saveSettings} className="flex-1">Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Auction;
