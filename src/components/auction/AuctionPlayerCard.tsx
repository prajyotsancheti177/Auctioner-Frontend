import { Player } from "@/types/auction";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getDriveThumbnail } from "@/lib/imageUtils";

interface PlayerCardProps {
  player: Player;
  isAnimated?: boolean;
  isSold?: boolean;
  className?: string;
  currentBid?: number;
  leadingTeamName?: string;
  leadingTeamLogo?: string;
  bidPrice?: number;
  onClick?: (player: Player) => void;
}


export const AuctionPlayerCard = ({ player, isAnimated, isSold, className, currentBid, leadingTeamName, leadingTeamLogo, bidPrice, onClick }: PlayerCardProps) => {
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
        "relative overflow-hidden rounded-2xl bg-card/60 border-2 border-border shadow-elevated transition-all w-full h-full",
        // keep row layout (image left, details right) across breakpoints
        "flex flex-row items-stretch",
        // Add cursor pointer and hover effects when clickable
        onClick && "cursor-pointer hover:shadow-2xl hover:scale-[1.02] hover:border-primary/50",
        // hover lift
        "hover:shadow-2xl hover:scale-[1.02] focus-within:scale-[1.02] transition-transform duration-200",
        isAnimated && "animate-pop-in",
        isSold && "animate-celebrate",
        className
      )}
    >
      {/* Player Image */}
      <div className="relative flex-shrink-0 w-36 h-56 md:w-[27rem] md:h-full overflow-hidden rounded-l-2xl">
        <img
          src={logoSrc}
          alt={player.name}
          className="h-full w-full object-cover object-top"
          onError={(e) => {
            e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(player.name) + '&size=400&background=random';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card/60 via-card/40 to-transparent" />

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
      <div className="p-3 flex-1 w-full md:pl-6 flex flex-col">
        {/* Glass panel for details */}
        <div className="w-full h-full bg-white/6 backdrop-blur-sm p-3 md:p-6 rounded-r-2xl flex flex-col justify-between">
          {/* Player name and base price moved down with increased spacing */}
          {currentBid !== undefined && (
            <div className="text-center mb-6 mt-6 md:mt-12">
              <h3 className="text-3xl md:text-6xl font-black text-foreground mb-4">
                {player.name}
              </h3>
              <p className="text-lg md:text-2xl text-muted-foreground font-semibold">
                Base: {player.basePrice} Pts. | Increment: {bidPrice} Pts.
              </p>
            </div>
          )}

          {/* Bid Display - Center of right side */}
          {currentBid !== undefined && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-lg md:text-2xl text-muted-foreground mb-3 font-semibold">Current Bid</p>
                <div className="text-6xl md:text-9xl font-black text-secondary mb-6">
                  {currentBid} Pts.
                </div>
                {leadingTeamName && (
                  <div className="flex items-center justify-center gap-4 mb-2">
                    {leadingTeamLogo && (
                      <div className="w-12 h-12 md:w-20 md:h-20 rounded-full overflow-hidden border-3 border-primary shadow-lg flex items-center justify-center bg-transparent">
                        <img
                          src={leadingTeamLogo}
                          alt={leadingTeamName}
                          className="w-10 h-10 md:w-16 md:h-16 object-contain"
                          onError={(e) => {
                            e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(leadingTeamName || 'Team') + '&size=200&background=random';
                          }}
                        />
                      </div>
                    )}
                    <div className="text-2xl md:text-6xl font-black text-primary">
                      {leadingTeamName}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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

          {/* Only show player details when not showing bid display */}
          {currentBid === undefined && (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};
