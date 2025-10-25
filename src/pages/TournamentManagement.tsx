import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Trophy, Users, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Tournament {
  _id: string;
  name?: string;
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

interface TournamentHost {
  _id: string;
  name: string;
  email: string;
}

interface TournamentFormData {
  name: string;
  tournamentHostId?: string;
  noOfTeams: number | string;
  maxPlayersPerTeam: number | string;
  minPlayersPerTeam: number | string;
  totalBudget: number | string;
  playerCategories: string;
}

export default function TournamentManagement() {
  const { toast } = useToast();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [tournamentHosts, setTournamentHosts] = useState<TournamentHost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isTournamentHost = user.role === "tournament_host";
  const canSelectHost = user.role === "boss" || user.role === "super_user";

  const [formData, setFormData] = useState<TournamentFormData>({
    name: "",
    tournamentHostId: "",
    noOfTeams: "",
    maxPlayersPerTeam: "",
    minPlayersPerTeam: "",
    totalBudget: "",
    playerCategories: "",
  });

  useEffect(() => {
    fetchTournaments();
    if (canSelectHost) {
      fetchTournamentHosts();
    }
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/api/tournament/all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          userRole: user.role,
        }),
      });

      const data = await response.json();
      console.log("Fetched tournaments data:", data); // Debug log
      if (response.ok) {
        setTournaments(data.data || []);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch tournaments",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching tournaments:", error); // Debug log
      toast({
        title: "Error",
        description: "Failed to fetch tournaments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTournamentHosts = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/tournament/hosts");
      const data = await response.json();
      if (response.ok) {
        setTournamentHosts(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch tournament hosts:", error);
    }
  };

  const handleInputChange = (field: keyof TournamentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      tournamentHostId: "",
      noOfTeams: "",
      maxPlayersPerTeam: "",
      minPlayersPerTeam: "",
      totalBudget: "",
      playerCategories: "",
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleOpenDialog = (tournament?: Tournament) => {
    if (tournament) {
      setIsEditing(true);
      setEditingId(tournament._id);
      setFormData({
        name: tournament.name || "",
        tournamentHostId: tournament.tournamentHostId?._id || "",
        noOfTeams: tournament.noOfTeams || "",
        maxPlayersPerTeam: tournament.maxPlayersPerTeam || "",
        minPlayersPerTeam: tournament.minPlayersPerTeam || "",
        totalBudget: tournament.totalBudget || "",
        playerCategories: tournament.playerCategories?.join(", ") || "",
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.noOfTeams || !formData.maxPlayersPerTeam || 
        !formData.minPlayersPerTeam || !formData.totalBudget) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (canSelectHost && !formData.tournamentHostId) {
      toast({
        title: "Validation Error",
        description: "Please select a tournament host",
        variant: "destructive",
      });
      return;
    }

    try {
      const categories = formData.playerCategories
        .split(",")
        .map((cat) => cat.trim())
        .filter((cat) => cat);

      const payload = {
        name: formData.name,
        noOfTeams: Number(formData.noOfTeams),
        maxPlayersPerTeam: Number(formData.maxPlayersPerTeam),
        minPlayersPerTeam: Number(formData.minPlayersPerTeam),
        totalBudget: Number(formData.totalBudget),
        playerCategories: categories,
        userId: user._id,
        userRole: user.role,
        ...(canSelectHost && { tournamentHostId: formData.tournamentHostId }),
      };

      let url = "http://localhost:3000/api/tournament/register";
      if (isEditing && editingId) {
        url = "http://localhost:3000/api/tournament/update";
        Object.assign(payload, { tournamentId: editingId });
      }

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          title: "Success",
          description: isEditing
            ? "Tournament updated successfully"
            : "Tournament created successfully",
        });
        handleCloseDialog();
        fetchTournaments();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to save tournament",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while saving the tournament",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      const response = await fetch("http://localhost:3000/api/tournament/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournamentId: deletingId,
          userId: user._id,
          userRole: user.role,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          title: "Success",
          description: "Tournament deleted successfully",
        });
        setDeleteDialogOpen(false);
        setDeletingId(null);
        fetchTournaments();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete tournament",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting the tournament",
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (tournamentId: string) => {
    setDeletingId(tournamentId);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading tournaments...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-3xl font-bold flex items-center gap-2">
                <Trophy className="h-8 w-8" />
                Tournament Management
              </CardTitle>
              <CardDescription className="mt-2">
                {isTournamentHost
                  ? "Manage your tournaments"
                  : "Manage all tournaments in the system"}
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Create Tournament
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {tournaments.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-lg text-gray-500">No tournaments found</p>
              <p className="text-sm text-gray-400 mt-2">
                Click "Create Tournament" to add your first tournament
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tournament Name</TableHead>
                  {!isTournamentHost && <TableHead>Host</TableHead>}
                  <TableHead className="text-center">Teams</TableHead>
                  <TableHead className="text-center">Players/Team</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tournaments.map((tournament) => (
                  <TableRow key={tournament._id}>
                    <TableCell className="font-medium">
                      {tournament.name || "Unnamed Tournament"}
                    </TableCell>
                    {!isTournamentHost && (
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {tournament.tournamentHostId?.name || "N/A"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {tournament.tournamentHostId?.email || ""}
                          </div>
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="text-center">
                      <Badge variant="secondary">
                        <Users className="h-3 w-3 mr-1" />
                        {tournament.noOfTeams || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {tournament.minPlayersPerTeam || 0} - {tournament.maxPlayersPerTeam || 0}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      <DollarSign className="inline h-4 w-4" />
                      {tournament.totalBudget?.toLocaleString() || "0"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {tournament.playerCategories?.slice(0, 3).map((cat, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {cat}
                          </Badge>
                        ))}
                        {(tournament.playerCategories?.length || 0) > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{(tournament.playerCategories?.length || 0) - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(tournament)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(tournament._id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Tournament Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Tournament" : "Create New Tournament"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the tournament details below"
                : "Fill in the details to create a new tournament"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tournament Name *</Label>
              <Input
                id="name"
                placeholder="e.g., IPL 2025"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>

            {canSelectHost && (
              <div className="grid gap-2">
                <Label htmlFor="host">Tournament Host *</Label>
                <Select
                  value={formData.tournamentHostId}
                  onValueChange={(value) =>
                    handleInputChange("tournamentHostId", value)
                  }
                  disabled={isEditing && isTournamentHost}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tournament host" />
                  </SelectTrigger>
                  <SelectContent>
                    {tournamentHosts.map((host) => (
                      <SelectItem key={host._id} value={host._id}>
                        {host.name} ({host.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="teams">Number of Teams *</Label>
                <Input
                  id="teams"
                  type="number"
                  placeholder="e.g., 8"
                  value={formData.noOfTeams}
                  onChange={(e) => handleInputChange("noOfTeams", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="budget">Total Budget *</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="e.g., 100000"
                  value={formData.totalBudget}
                  onChange={(e) => handleInputChange("totalBudget", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="minPlayers">Min Players per Team *</Label>
                <Input
                  id="minPlayers"
                  type="number"
                  placeholder="e.g., 11"
                  value={formData.minPlayersPerTeam}
                  onChange={(e) =>
                    handleInputChange("minPlayersPerTeam", e.target.value)
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="maxPlayers">Max Players per Team *</Label>
                <Input
                  id="maxPlayers"
                  type="number"
                  placeholder="e.g., 15"
                  value={formData.maxPlayersPerTeam}
                  onChange={(e) =>
                    handleInputChange("maxPlayersPerTeam", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="categories">
                Player Categories (comma-separated)
              </Label>
              <Input
                id="categories"
                placeholder="e.g., Batsman, Bowler, All-rounder, Wicket-keeper"
                value={formData.playerCategories}
                onChange={(e) =>
                  handleInputChange("playerCategories", e.target.value)
                }
              />
              <p className="text-xs text-gray-500">
                Separate multiple categories with commas
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {isEditing ? "Update Tournament" : "Create Tournament"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              tournament and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
