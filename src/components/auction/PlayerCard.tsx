import { Player } from "@/types/auction";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import placeholderImage from "@/assets/player-placeholder.jpg";

interface PlayerCardProps {
  player: Player;
  isAnimated?: boolean;
  isSold?: boolean;
  className?: string;
}

export const PlayerCard = ({ player, isAnimated, isSold, className }: PlayerCardProps) => {
  // console.log("Rendering PlayerCard for:", player);
  const formatPrice = (price: number) => {
    return `₹${(price / 100000).toFixed(1)}L`;
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-card border-2 border-border shadow-elevated transition-all",
        isAnimated && "animate-pop-in",
        isSold && "animate-celebrate",
        className
      )}
    >
      {/* Player Image */}
      <div className="relative h-80 overflow-hidden">
        <img
          src={placeholderImage}
          alt={player.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
        
        {/* Skill Badge */}
        <div className="absolute top-4 right-4">
          <Badge
            variant={
              player.skill === "All-Rounder"
                ? "default"
                : player.skill === "Batsman"
                ? "secondary"
                : "outline"
            }
            className="text-sm font-bold shadow-lg"
          >
            {player.skill}
          </Badge>
        </div>

        {/* Status Badge */}
        {player.status === "Sold" && (
          <div className="absolute top-4 left-4">
            <Badge className="bg-accent text-accent-foreground font-bold shadow-lg">
              SOLD
            </Badge>
          </div>
        )}
      </div>

      {/* Player Details */}
      <div className="p-6 space-y-4">
        <h3 className="text-6xl font-black text-foreground text-center">{player.name}</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Base Price</p>
            <p className="text-lg font-bold text-foreground">
              {player.basePrice}
            </p>
          </div>

          {player.amtSold > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Sold Price</p>
              <p className="text-lg font-bold text-secondary">
                {player.amtSold}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
