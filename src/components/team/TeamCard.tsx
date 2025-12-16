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

  const formatBudget = (amount: number) => {
    return amount.toString();
  };

  return (
    <Link to={`/team/${team._id}`}>
      <Card className="group relative overflow-hidden border hover:border-primary sm:border-2 transition-all hover:shadow-glow cursor-pointer">
        <div className="p-2 sm:p-4 md:p-6 space-y-2 sm:space-y-4 md:space-y-6">
          {/* Team Header - Compact */}
          <div className="flex items-center gap-2 sm:gap-4">
            <img
              src={logoSrc}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = placeholderImg; }}
              alt={`${team.name} logo`}
              className="h-8 w-8 sm:h-12 sm:w-12 md:h-16 md:w-16 rounded-full shadow-lg transition-transform group-hover:scale-110 object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-xs sm:text-lg md:text-2xl font-bold text-foreground group-hover:text-primary transition-colors truncate">
                {team.name}
              </h3>
              <p className="text-[10px] sm:text-sm text-muted-foreground truncate">{team.owner?.name || "-"}</p>
            </div>
          </div>

          {/* Budget Info - Compact */}
          <div className="space-y-1 sm:space-y-2">
            <div className="flex items-center justify-between text-[10px] sm:text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Wallet className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Budget</span>
              </div>
              <span className="font-bold text-foreground text-[8px] sm:text-sm">
                <span className="text-secondary">{formatBudget(team.totalSpent)}</span>
                <span className="text-muted-foreground">/{formatBudget(team.remainingBudget + team.totalSpent)}</span>
              </span>
            </div>
            <Progress value={budgetUsedPercentage} className="h-1 sm:h-2" />
            <p className="text-[8px] sm:text-sm font-medium text-accent">
              {formatBudget(team.remainingBudget)} left
            </p>
          </div>

          {/* Player Info - Compact */}
          <div className="space-y-1 sm:space-y-2">
            <div className="flex items-center justify-between text-[10px] sm:text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Squad</span>
              </div>
              <span className="font-bold text-foreground text-[8px] sm:text-sm">
                {team.players.length}/{team.maxPlayersPerTeam}
              </span>
            </div>
            <Progress value={playersBoughtPercentage} className="h-1 sm:h-2" />
            <p className="text-[8px] sm:text-sm font-medium text-accent">
              {team.maxPlayersPerTeam - team.players.length} slots
            </p>
          </div>
        </div>

        {/* Hover Effect */}
        <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity" />
      </Card>
    </Link>
  );
};

