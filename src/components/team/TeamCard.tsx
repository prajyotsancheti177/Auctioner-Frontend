import { Team } from "@/types/auction";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import placeholderImg from "@/assets/player-placeholder.jpg";

interface TeamCardProps {
  team: Team;
}

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

export const TeamCard = ({ team }: TeamCardProps) => {
  const budgetUsedPercentage = (team.totalSpent / (team.remainingBudget + team.totalSpent)) * 100;

  const playersBoughtPercentage = (team.players.length / team.maxPlayersPerTeam) * 100;

  const logoSrc = getDriveThumbnail(team.logo as unknown as string);

  return (
    <Link to={`/team/${team._id}`}>
      <Card className="group relative overflow-hidden border-2 hover:border-primary transition-all hover:shadow-glow cursor-pointer">
        <div className="p-6 space-y-6">
          {/* Team Header */}
          <div className="flex items-center gap-4">
            <img
              src={logoSrc}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = placeholderImg; }}
              alt={`${team.name} logo`}
              className="h-16 w-16 rounded-full shadow-lg transition-transform group-hover:scale-110"
            />
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                {team.name}
              </h3>
              <p className="text-sm text-muted-foreground">Owner: {team.owner.name}</p>
            </div>
          </div>

          {/* Budget Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Wallet className="h-4 w-4" />
                <span>Budget Used</span>
              </div>
              <span className="font-bold text-foreground">
                ₹{team.totalSpent} / ₹{(team.remainingBudget + team.totalSpent)}
              </span>
            </div>
            <Progress value={budgetUsedPercentage} className="h-2" />
            <p className="text-sm font-medium text-accent">
              Remaining: ₹{team.remainingBudget}
            </p>
          </div>

          {/* Player Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Wallet className="h-4 w-4" />
                <span>Squad</span>
              </div>
              <span className="font-bold text-foreground">
                {team.players.length} / {team.maxPlayersPerTeam}
              </span>
            </div>
            <Progress value={playersBoughtPercentage} className="h-2" />
            <p className="text-sm font-medium text-accent">
              {team.maxPlayersPerTeam - team.players.length} slots remaining
            </p>
          </div>
        </div>

        {/* Hover Effect */}
        <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity" />
      </Card>
    </Link>
  );
};
