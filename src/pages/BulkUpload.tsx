import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Upload, FileSpreadsheet, Users, UserCheck } from "lucide-react";
import { getSelectedTournamentId } from "@/lib/tournamentUtils";
import apiConfig from "@/config/apiConfig";

const BulkUpload = () => {
  const [teamsFile, setTeamsFile] = useState<File | null>(null);
  const [playersFile, setPlayersFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [isUploading, setIsUploading] = useState(false);

  // Generate sample CSV for teams
  const downloadTeamsSample = () => {
    const csvContent = `Team Name,Team Logo URL,Total Budget,Max Players Per Team
Mumbai Mavericks,https://drive.google.com/file/d/1234567890/view,10000,15
Delhi Dragons,https://drive.google.com/file/d/0987654321/view,10000,15
Bangalore Bulls,https://drive.google.com/file/d/1122334455/view,10000,15`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "teams_sample.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate sample CSV for players
  const downloadPlayersSample = () => {
    const csvContent = `Player Name,Photo URL,Base Price,Player Category
Virat Kohli,https://drive.google.com/file/d/1234567890/view,500,Icon
MS Dhoni,https://drive.google.com/file/d/0987654321/view,500,Icon
Rohit Sharma,https://drive.google.com/file/d/1122334455/view,400,Icon
Jasprit Bumrah,https://drive.google.com/file/d/2233445566/view,300,Regular
KL Rahul,https://drive.google.com/file/d/3344556677/view,250,Regular
Shubman Gill,https://drive.google.com/file/d/4455667788/view,150,Youth`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "players_sample.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parse CSV file
  const parseCSV = (text: string): Record<string, string>[] => {
    const lines = text.split("\n").filter(line => line.trim());
    const headers = lines[0].split(",").map(h => h.trim());
    const data: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map(v => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      data.push(row);
    }

    return data;
  };

  // Upload teams CSV
  const handleTeamsUpload = async () => {
    if (!teamsFile) {
      setUploadStatus({ type: "error", message: "Please select a teams CSV file" });
      return;
    }

    setIsUploading(true);
    setUploadStatus({ type: null, message: "" });

    try {
      const text = await teamsFile.text();
      const teamsData = parseCSV(text);
      const tournamentId = getSelectedTournamentId();

      // Transform data to match API format
      const teams = teamsData.map((team) => ({
        name: team["Team Name"],
        logo: team["Team Logo URL"],
        totalBudget: parseInt(team["Total Budget"]) || 0,
        maxPlayersPerTeam: parseInt(team["Max Players Per Team"]) || 0,
        touranmentId: tournamentId,
      }));

      const response = await fetch(`${apiConfig.baseUrl}/api/team/bulk-create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teams, touranmentId: tournamentId }),
      });

      if (!response.ok) {
        throw new Error("Failed to upload teams");
      }

      const result = await response.json();
      setUploadStatus({
        type: "success",
        message: `Successfully uploaded ${teams.length} teams!`,
      });
      setTeamsFile(null);
    } catch (error) {
      console.error("Error uploading teams:", error);
      setUploadStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to upload teams",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Upload players CSV
  const handlePlayersUpload = async () => {
    if (!playersFile) {
      setUploadStatus({ type: "error", message: "Please select a players CSV file" });
      return;
    }

    setIsUploading(true);
    setUploadStatus({ type: null, message: "" });

    try {
      const text = await playersFile.text();
      const playersData = parseCSV(text);
      const tournamentId = getSelectedTournamentId();

      // Transform data to match API format
      const players = playersData.map((player) => ({
        name: player["Player Name"],
        photo: player["Photo URL"],
        basePrice: parseInt(player["Base Price"]) || 0,
        playerCategory: player["Player Category"],
        touranmentId: tournamentId,
        sold: false,
        auctionStatus: false,
      }));

      const response = await fetch(`${apiConfig.baseUrl}/api/player/bulk-create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ players, touranmentId: tournamentId }),
      });

      if (!response.ok) {
        throw new Error("Failed to upload players");
      }

      const result = await response.json();
      setUploadStatus({
        type: "success",
        message: `Successfully uploaded ${players.length} players!`,
      });
      setPlayersFile(null);
    } catch (error) {
      console.error("Error uploading players:", error);
      setUploadStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to upload players",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Bulk Upload</h1>
        <p className="text-muted-foreground">
          Download sample CSV files, fill in your data, and upload to quickly add teams and players
        </p>
      </div>

      {uploadStatus.type && (
        <Alert
          className={`mb-6 ${
            uploadStatus.type === "success"
              ? "border-green-500 bg-green-50 text-green-900"
              : "border-red-500 bg-red-50 text-red-900"
          }`}
        >
          <AlertDescription>{uploadStatus.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Teams Upload Section */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Teams</h2>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Step 1: Download Sample</h3>
              <Button
                onClick={downloadTeamsSample}
                variant="outline"
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Teams Sample CSV
              </Button>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Step 2: Upload Filled CSV</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="teams-file">Select Teams CSV File</Label>
                  <Input
                    id="teams-file"
                    type="file"
                    accept=".csv"
                    onChange={(e) => setTeamsFile(e.target.files?.[0] || null)}
                    className="mt-1"
                  />
                </div>
                {teamsFile && (
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    {teamsFile.name}
                  </div>
                )}
                <Button
                  onClick={handleTeamsUpload}
                  disabled={!teamsFile || isUploading}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? "Uploading..." : "Upload Teams"}
                </Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold text-sm mb-2">CSV Format:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Team Name</li>
                <li>• Team Logo URL (Google Drive link)</li>
                <li>• Total Budget</li>
                <li>• Max Players Per Team</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Players Upload Section */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <UserCheck className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Players</h2>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Step 1: Download Sample</h3>
              <Button
                onClick={downloadPlayersSample}
                variant="outline"
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Players Sample CSV
              </Button>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Step 2: Upload Filled CSV</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="players-file">Select Players CSV File</Label>
                  <Input
                    id="players-file"
                    type="file"
                    accept=".csv"
                    onChange={(e) => setPlayersFile(e.target.files?.[0] || null)}
                    className="mt-1"
                  />
                </div>
                {playersFile && (
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    {playersFile.name}
                  </div>
                )}
                <Button
                  onClick={handlePlayersUpload}
                  disabled={!playersFile || isUploading}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? "Uploading..." : "Upload Players"}
                </Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold text-sm mb-2">CSV Format:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Player Name</li>
                <li>• Photo URL (Google Drive link)</li>
                <li>• Base Price</li>
                <li>• Player Category</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mt-6 p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-blue-600" />
          Important Notes:
        </h3>
        <ul className="text-sm space-y-2 text-blue-900">
          <li>• Make sure your CSV file follows the exact format shown in the sample files</li>
          <li>• Column names must match exactly (case-sensitive)</li>
          <li>• For Google Drive URLs, use the direct file link</li>
          <li>• All numeric fields (Budget, Price) should contain only numbers</li>
          <li>• Player categories should match your tournament configuration</li>
          <li>• Upload teams before players for best results</li>
        </ul>
      </Card>
    </div>
  );
};

export default BulkUpload;
