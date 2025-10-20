import { Team } from "@/types/auction";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { getDriveThumbnail } from "@/lib/imageUtils";
import placeholderImg from "@/assets/player-placeholder.jpg";

interface TeamCardProps {
  team: Team;
}

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
                {team.totalSpent} / {team.remainingBudget + team.totalSpent} Pts.
              </span>
            </div>
            <Progress value={budgetUsedPercentage} className="h-2" />
            <p className="text-sm font-medium text-accent">
              Remaining: {team.remainingBudget} Pts.
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
