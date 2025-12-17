import { Player } from "@/types/auction";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getDriveThumbnail } from "@/lib/imageUtils";

interface PlayerCardProps {
  player: Player;
  isAnimated?: boolean;
  isSold?: boolean;
  className?: string;
  onClick?: (player: Player) => void;
}

export const PlayerCard = ({ player, isAnimated, isSold, className, onClick }: PlayerCardProps) => {
  const formatPrice = (price: number) => {
    if (price >= 100) {
      return `${price} Pts`;
    }
    return `${price} Pts`;
  };

  const logoSrc = getDriveThumbnail(player.photo as unknown as string);

  const handleClick = () => {
    if (onClick) {
      onClick(player);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "relative overflow-hidden rounded-lg sm:rounded-2xl bg-card border border-border sm:border-2 shadow-elevated transition-all w-full",
        // mobile: column layout for compact cards. md+: stacked column with larger image
        "flex flex-col",
        // Add cursor pointer and hover effects when clickable
        onClick && "cursor-pointer hover:shadow-2xl hover:scale-[1.02] hover:border-primary/50",
        isAnimated && "animate-pop-in",
        isSold && "animate-celebrate",
        className
      )}
    >
      {/* Player Image - Much smaller on mobile */}
      <div className="relative flex-shrink-0 w-full h-20 sm:h-32 md:h-48 lg:h-64 overflow-hidden">
        <img
          src={logoSrc}
          alt={player.name}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(player.name)}&backgroundColor=6366f1,8b5cf6,ec4899&backgroundType=gradientLinear&fontSize=40&fontWeight=600`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />

        {/* Status Badge - Top left */}
        <div className="absolute top-0.5 sm:top-2 md:top-4 left-0.5 sm:left-2 md:left-4">
          {(() => {
            const isSold = !!player.sold;
            const isAuctioned = !!player.auctionStatus;
            if (isSold) {
              return <Badge className="bg-accent text-accent-foreground font-bold shadow-lg text-[8px] sm:text-xs px-1 py-0 sm:px-2 sm:py-1 leading-tight">SOLD</Badge>;
            }
            if (isAuctioned && !isSold) {
              return <Badge className="bg-destructive text-destructive-foreground font-bold shadow-lg text-[8px] sm:text-xs px-1 py-0 sm:px-2 sm:py-1 leading-tight">UNSOLD</Badge>;
            }
            return null;
          })()}
        </div>

        {/* Serial Badge - Top right (below Category if visible, or top right) */}
        <div className="absolute top-0.5 sm:top-2 md:top-4 right-0.5 sm:right-2 md:right-4 flex flex-col items-end gap-1">
          <div className="hidden sm:block">
            <Badge
              variant={
                player.playerCategory === "Regular"
                  ? "default"
                  : player.playerCategory === "Icon"
                    ? "secondary"
                    : "outline"
              }
              className="text-[10px] sm:text-xs font-bold shadow-lg px-1.5 py-0.5 sm:px-2 sm:py-1"
            >
              {player.playerCategory}
            </Badge>
          </div>
          {player.auctionSerialNumber && (
            <Badge variant="outline" className="text-[10px] sm:text-xs font-bold shadow-lg bg-background/50 backdrop-blur-md border-primary/50 text-foreground px-1.5 py-0.5 sm:px-2 sm:py-1">
              #{player.auctionSerialNumber}
            </Badge>
          )}
        </div>
      </div>

      {/* Player Details - Compact on mobile */}
      <div className="p-1.5 sm:p-2 md:p-4 flex-1 w-full">
        {/* Player Name */}
        <h3 className="text-xs sm:text-sm md:text-lg lg:text-xl font-bold text-foreground truncate leading-tight">
          {player.name}
        </h3>

        {/* Team name when player is sold */}
        {player.teamName && (
          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
            → <span className="font-medium text-foreground">{player.teamName}</span>
          </p>
        )}

        {/* Price info - Single row on mobile */}
        <div className="mt-1 sm:mt-2 flex items-center justify-between gap-1 sm:gap-2">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-muted-foreground">Base</p>
            <p className="text-xs sm:text-sm md:text-base font-bold text-foreground truncate">
              {player.basePrice !== undefined ? formatPrice(player.basePrice) : "-"}
            </p>
          </div>

          {player.amtSold > 0 && (
            <div className="text-right min-w-0">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Sold</p>
              <p className="text-xs sm:text-sm md:text-base font-bold text-secondary truncate">
                {formatPrice(player.amtSold)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

