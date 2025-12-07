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
  // console.log("Rendering PlayerCard for:", player);
  const formatPrice = (price: number) => {
    return `${price} Pts.`;
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
        "relative overflow-hidden rounded-2xl bg-card border-2 border-border shadow-elevated transition-all w-full",
        // mobile: row (image left, details right). md+: stacked column
        "flex flex-row md:flex-col items-center md:items-stretch",
        // Add cursor pointer and hover effects when clickable
        onClick && "cursor-pointer hover:shadow-2xl hover:scale-[1.02] hover:border-primary/50",
        isAnimated && "animate-pop-in",
        isSold && "animate-celebrate",
        className
      )}
    >
      {/* Player Image */}
      <div className="relative flex-shrink-0 w-32 h-32 md:w-full md:h-80 overflow-hidden">
        <img
          src={logoSrc}
          alt={player.name}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(player.name) + '&size=400&background=random';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />

        {/* Image badges: visible on md+ (stacked layout) */}
        <div className="hidden md:block">
          {/* Skill Badge */}
          <div className="absolute top-4 right-4">
            <Badge
              variant={
                player.playerCategory === "Regular"
                  ? "default"
                  : player.playerCategory === "Icon"
                    ? "secondary"
                    : "outline"
              }
              className="text-sm font-bold shadow-lg"
            >
              {player.playerCategory}
            </Badge>
          </div>

          {/* Status Badge */}
          {(() => {
            const isSold = !!player.sold;
            const isAuctioned = !!player.auctionStatus;
            if (isSold) {
              return (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-accent text-accent-foreground font-bold shadow-lg">SOLD</Badge>
                </div>
              );
            }
            if (isAuctioned && !isSold) {
              return (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-destructive text-destructive-foreground font-bold shadow-lg">UNSOLD</Badge>
                </div>
              );
            }
            return (
              <div className="absolute top-4 left-4">
                <Badge className="bg-warning text-warning-foreground font-bold shadow-lg">REMAINING</Badge>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Player Details */}
      <div className="p-2 md:p-6 flex-1 w-full md:pl-4">
        {/* Mobile badges: visible on small screens (row layout) to avoid overlap */}
        <div className="flex items-center justify-between mb-2 md:hidden w-full">
          <div>
            {(() => {
              const isSold = !!player.sold;
              const isAuctioned = !!player.auctionStatus;
              if (isSold) {
                return <Badge className="bg-accent text-accent-foreground font-bold shadow-sm text-xs">SOLD</Badge>;
              }
              if (isAuctioned && !isSold) {
                return <Badge className="bg-destructive text-destructive-foreground font-bold shadow-sm text-xs">UNSOLD</Badge>;
              }
              return <Badge className="bg-warning text-warning-foreground font-bold shadow-sm text-xs">REMAINING</Badge>;
            })()}
          </div>

          <div className="max-w-[70%] text-right">
            <Badge
              variant={
                player.playerCategory === "Regular"
                  ? "default"
                  : player.playerCategory === "Icon"
                    ? "secondary"
                    : "outline"
              }
              className="text-xs font-bold shadow-sm whitespace-nowrap"
            >
              {player.playerCategory}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-center gap-3 md:flex-col">
          {/* Mobile: single-line truncated */}
          <h3 className="text-base md:hidden font-black text-foreground truncate">{player.name}</h3>

          {/* Desktop: allow up to 2 lines, centered */}
          <div className="hidden md:block">
            <h3
              className="md:text-4xl font-black text-foreground text-center"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {player.name}
            </h3>
          </div>

          {/* Team name when player is sold (desktop) */}
          {player.teamName && (
            <p className="hidden md:block text-sm text-muted-foreground md:text-center">Sold to <span className="font-bold text-foreground">{player.teamName}</span></p>
          )}
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <div>
            <p className="text-xs md:text-sm text-muted-foreground mb-1">Base Price</p>
            <p className="text-sm md:text-lg font-bold text-foreground">
              {player.basePrice !== undefined ? formatPrice(player.basePrice) : "-"}
            </p>
          </div>

          {player.amtSold > 0 && (
            <div>
              <p className="text-xs md:text-sm text-muted-foreground mb-1">Sold Price</p>
              <p className="text-sm md:text-lg font-bold text-secondary">
                {player.amtSold !== undefined ? formatPrice(player.amtSold) : "-"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
