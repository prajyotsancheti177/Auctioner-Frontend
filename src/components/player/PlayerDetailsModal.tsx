import { useState, useEffect } from "react";
import { Player, PlayerSkill } from "@/types/auction";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
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
import {
  User,
  Mail,
  Phone,
  MapPin,
  Trophy,
  Calendar,
  Edit3,
  Save,
  X,
  DollarSign,
  Users,
  Trash2
} from "lucide-react";
import placeholderImg from "@/assets/player-placeholder.jpg";
import apiConfig from "@/config/apiConfig";
import { getDriveThumbnail } from "@/lib/imageUtils";

interface Team {
  _id: string;
  name: string;
}

interface PlayerDetailsModalProps {
  player: Player | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedPlayer: Player) => void;
  onDelete?: (playerId: string) => void;
}

export const PlayerDetailsModal = ({ player, isOpen, onClose, onUpdate, onDelete }: PlayerDetailsModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [playerCategories, setPlayerCategories] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [editData, setEditData] = useState<Partial<Player>>({});

  const skillOptions: PlayerSkill[] = ["Batsman", "Bowler", "All-Rounder", "Wicket-Keeper"];
  const genderOptions = ["Male", "Female", "Other"];

  // Check authentication status
  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated") === "true";
    setIsAuthenticated(authStatus);
  }, []);

  // Fetch teams when modal opens - using player's tournament ID
  useEffect(() => {
    const fetchTeams = async () => {
      if (!player?.touranmentId) {
        console.warn("Player has no tournament ID");
        return;
      }

      try {
        const response = await fetch(`${apiConfig.baseUrl}/api/team/all`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            touranmentId: player.touranmentId,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setTeams(data.data[0].teams || []);
        }
      } catch (err) {
        console.error("Error fetching teams:", err);
      }
    };

    if (isOpen && player) {
      fetchTeams();
    }
  }, [isOpen, player]);

  // Fetch player categories from API
  useEffect(() => {
    const fetchPlayerCategories = async () => {
      if (!player?.touranmentId) {
        console.warn("Player has no tournament ID");
        return;
      }

      try {
        const response = await fetch(`${apiConfig.baseUrl}/api/player/categories`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            touranmentId: player.touranmentId,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && Array.isArray(data.data)) {
            setPlayerCategories(data.data);
          }
        }
      } catch (err) {
        console.error("Error fetching player categories:", err);
      }
    };

    if (isOpen && player) {
      fetchPlayerCategories();
    }
  }, [isOpen, player]);

  if (!player) return null;

  const handleEdit = () => {
    setEditData({
      name: player.name,
      age: player.age,
      mobile: player.mobile?.toString(),
      email: player.email || "",
      address: player.address || "",
      skills: player.skills || [],
      playerCategory: player.playerCategory || "Regular",
      photo: player.photo || "",
      sold: player.sold,
      auctionStatus: player.auctionStatus,
      amtSold: player.amtSold || 0,
      teamId: player.teamId || "none"
    });
    setIsEditing(true);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
    setError("");
    setSuccess("");
  };

  const handleInputChange = (field: keyof Player, value: any) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
    setError("");
  };

  const handleSkillChange = (skill: PlayerSkill, checked: boolean) => {
    setEditData(prev => ({
      ...prev,
      skills: checked
        ? [...(prev.skills || []), skill]
        : (prev.skills || []).filter(s => s !== skill)
    }));
  };

  const validateForm = (): boolean => {
    if (!editData.name?.trim()) {
      setError("Player name is required");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Get user ID from localStorage for authentication
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?._id;

      if (!userId) {
        setError("You must be logged in to update player data");
        setLoading(false);
        return;
      }

      const payload = {
        playerId: player._id,
        userId, // Include userId for authentication middleware
        name: editData.name?.trim(),
        age: editData.age ? parseInt(editData.age.toString()) : undefined,
        mobile: editData.mobile ? parseInt(editData.mobile.toString()) : undefined,
        email: editData.email?.trim() || undefined,
        address: editData.address?.trim() || undefined,
        skills: editData.skills && editData.skills.length > 0 ? editData.skills : undefined,
        playerCategory: editData.playerCategory || undefined,
        photo: editData.photo || undefined,
        sold: editData.sold,
        auctionStatus: editData.auctionStatus,
        amtSold: editData.amtSold ? parseInt(editData.amtSold.toString()) : undefined,
        teamId: editData.teamId && editData.teamId !== "none" ? editData.teamId : null
      };

      // Remove undefined values from payload
      const cleanedPayload = Object.fromEntries(
        Object.entries(payload).filter(([_, value]) => value !== undefined)
      );

      const response = await fetch(`${apiConfig.baseUrl}/api/player/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Update failed');
      }

      const result = await response.json();
      setSuccess("Player updated successfully!");
      setIsEditing(false);

      // Call onUpdate if provided to refresh parent component
      if (onUpdate && result.data) {
        onUpdate(result.data);
      }

      setTimeout(() => setSuccess(""), 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!player) return;

    setDeleting(true);
    setError("");

    try {
      // Get user ID from localStorage for authentication
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?._id;

      if (!userId) {
        setError("You must be logged in to delete player data");
        setDeleting(false);
        setShowDeleteDialog(false);
        return;
      }

      const response = await fetch(`${apiConfig.baseUrl}/api/player/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId: player._id,
          userId // Include userId for authentication middleware
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Delete failed');
      }

      setSuccess("Player deleted successfully!");

      // Call onDelete if provided to refresh parent component
      if (onDelete) {
        onDelete(player._id);
      }

      setTimeout(() => {
        setShowDeleteDialog(false);
        onClose();
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed. Please try again.');
      setShowDeleteDialog(false);
    } finally {
      setDeleting(false);
    }
  };

  const logoSrc = getDriveThumbnail(player.photo as string);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <User className="h-6 w-6" />
            {isEditing ? "Edit Player Details" : "Player Details"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Modify player information below" : "View comprehensive player information"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Player Photo */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-4">
                <div className="aspect-[3/4] relative overflow-hidden rounded-lg">
                  <img
                    src={logoSrc}
                    alt={player.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {isEditing && (
                  <div className="mt-3 space-y-2">
                    <Label htmlFor="photo">Photo URL</Label>
                    <Input
                      id="photo"
                      type="url"
                      placeholder="Enter photo URL"
                      value={editData.photo || ""}
                      onChange={(e) => handleInputChange('photo', e.target.value)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Player Information */}
          <div className="md:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editData.name || ""}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                      />
                    ) : (
                      <p className="text-lg font-medium">{player.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    {isEditing ? (
                      <Input
                        id="age"
                        type="number"
                        value={editData.age || ""}
                        onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                      />
                    ) : (
                      <p className="text-lg">{player.age} years</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Label>Player Category</Label>
                  {isEditing ? (
                    <Select
                      value={editData.playerCategory || ""}
                      onValueChange={(value) => handleInputChange('playerCategory', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {playerCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant={player.playerCategory === "Icon" ? "secondary" : "default"}>
                      {player.playerCategory}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Mobile
                    </Label>
                    {isEditing ? (
                      <Input
                        type="tel"
                        value={editData.mobile || ""}
                        onChange={(e) => handleInputChange('mobile', e.target.value)}
                        maxLength={10}
                      />
                    ) : (
                      <p>{player.mobile || "Not provided"}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={editData.email || ""}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    ) : (
                      <p>{player.email || "Not provided"}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Address
                    </Label>
                    {isEditing ? (
                      <Textarea
                        value={editData.address || ""}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        rows={2}
                      />
                    ) : (
                      <p>{player.address || "Not provided"}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cricket Details */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Cricket Details
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Skills</Label>
                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-3">
                        {skillOptions.map((skill) => (
                          <div key={skill} className="flex items-center space-x-2">
                            <Checkbox
                              id={skill}
                              checked={(editData.skills || []).includes(skill)}
                              onCheckedChange={(checked) => handleSkillChange(skill, checked as boolean)}
                            />
                            <Label htmlFor={skill} className="text-sm">
                              {skill}
                            </Label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {player.skills?.map((skill) => (
                          <Badge key={skill} variant="outline">
                            {skill}
                          </Badge>
                        )) || <p className="text-muted-foreground">No skills specified</p>}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Base Price
                    </Label>
                    <p className="text-lg font-semibold">{player.basePrice} Points</p>
                    {isEditing && (
                      <p className="text-xs text-muted-foreground">
                        Base price is set by the tournament category and cannot be edited
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Auction Status */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Auction Status
                </h3>

                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sold">Sold Status</Label>
                      <Switch
                        id="sold"
                        checked={editData.sold || false}
                        onCheckedChange={(checked) => handleInputChange('sold', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="auctionStatus">Auction Status (Auctioned)</Label>
                      <Switch
                        id="auctionStatus"
                        checked={editData.auctionStatus || false}
                        onCheckedChange={(checked) => handleInputChange('auctionStatus', checked)}
                      />
                    </div>

                    {editData.sold && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="amtSold">Sold Amount (Points)</Label>
                          <Input
                            id="amtSold"
                            type="number"
                            value={editData.amtSold || ""}
                            onChange={(e) => handleInputChange('amtSold', parseInt(e.target.value) || 0)}
                            min="0"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="teamId">Team</Label>
                          <Select
                            value={editData.teamId as string || "none"}
                            onValueChange={(value) => handleInputChange('teamId', value === "none" ? null : value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select team" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No Team</SelectItem>
                              {teams.map((team) => (
                                <SelectItem key={team._id} value={team._id}>
                                  {team.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-sm text-muted-foreground">Status</Label>
                        <Badge variant={player.sold ? "default" : "secondary"}>
                          {player.sold ? "SOLD" : player.auctionStatus ? "UNSOLD" : "NOT AUCTIONED"}
                        </Badge>
                      </div>

                      {player.sold && player.amtSold && (
                        <div className="space-y-1">
                          <Label className="text-sm text-muted-foreground">Sold Amount</Label>
                          <p className="text-lg font-semibold text-green-600">{player.amtSold} Points</p>
                        </div>
                      )}
                    </div>

                    {player.sold && player.teamName && (
                      <div className="space-y-1">
                        <Label className="text-sm text-muted-foreground">Team</Label>
                        <p className="text-lg font-semibold">{player.teamName}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Messages */}
            {error && (
              <Alert className="border-destructive">
                <AlertDescription className="text-destructive">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-500 bg-green-50">
                <AlertDescription className="text-green-700">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              ) : (
                <>
                  {isAuthenticated ? (
                    <>
                      <Button
                        onClick={() => setShowDeleteDialog(true)}
                        variant="destructive"
                        className="flex-1"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Player
                      </Button>
                      <Button
                        onClick={onClose}
                        variant="outline"
                        className="flex-1"
                      >
                        Close
                      </Button>
                      <Button
                        onClick={handleEdit}
                        className="flex-1"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Details
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={onClose}
                      variant="outline"
                      className="w-full"
                    >
                      Close
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the player
              <span className="font-semibold"> {player?.name}</span> from the tournament.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete Player"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};