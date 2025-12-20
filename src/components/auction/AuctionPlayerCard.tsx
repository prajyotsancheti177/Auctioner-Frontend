import { Player } from "@/types/auction";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getDriveThumbnail } from "@/lib/imageUtils";

interface PlayerCardProps {
  player: Player | null; // Allow null
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
  if (!player) {
    return (
      <div className={cn(
        "relative overflow-hidden rounded-2xl bg-card/60 border-2 border-border shadow-elevated w-full h-full flex items-center justify-center",
        className
      )}>
        <div className="text-center p-8">
          <div className="w-32 h-32 bg-muted/20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-4xl">👤</span>
          </div>
          <h3 className="text-2xl font-bold text-muted-foreground">No Player Selected</h3>
        </div>
      </div>
    );
  }

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
        "relative rounded-2xl bg-card/60 border-2 border-border shadow-elevated transition-all w-full min-h-full",
        // Column on mobile (image top), row on desktop (image left)
        "flex flex-col md:flex-row items-stretch",
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
      <div className="relative flex-shrink-0 w-full h-64 sm:h-72 md:w-[24rem] lg:w-[27rem] md:h-auto md:min-h-full overflow-hidden rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none">
        <img
          src={logoSrc}
          alt={player.name}
          className="h-full w-full object-cover object-top"
          onError={(e) => {
            e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(player.name)}&backgroundColor=6366f1,8b5cf6,ec4899&backgroundType=gradientLinear&fontSize=40&fontWeight=600`;
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

          {/* Serial Number Badge */}
          {player.auctionSerialNumber && (
            <div className="absolute top-16 right-4">
              <Badge variant="outline" className="text-sm font-bold shadow-lg bg-background/50 backdrop-blur-md border-primary/50 text-foreground">
                #{player.auctionSerialNumber}
              </Badge>
            </div>
          )}

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
        <div className="w-full h-full bg-white/6 backdrop-blur-sm p-3 md:p-6 rounded-b-2xl md:rounded-r-2xl md:rounded-bl-none flex flex-col justify-between">
          {/* Player name and base price moved down with increased spacing */}
          {currentBid !== undefined && (
            <div className="text-center mb-6 mt-6 md:mt-12">
              <h3 className="text-lg sm:text-2xl md:text-6xl font-black text-foreground mb-2 md:mb-4">
                {player.auctionSerialNumber && (
                  <span className="text-secondary mr-1 sm:mr-2 md:mr-4">
                    #{player.auctionSerialNumber}
                  </span>
                )}
                {player.name}
              </h3>
              <p className="text-xs sm:text-sm md:text-2xl text-muted-foreground font-semibold">
                Base: {player.basePrice} Pts. | Increment: {bidPrice} Pts.
              </p>
            </div>
          )}

          {/* Bid Display - Center of right side */}
          {currentBid !== undefined && (
            <div className="flex-1 flex items-center justify-center py-2 md:py-4">
              <div className="text-center w-full px-2">
                <p className="text-base sm:text-lg md:text-2xl text-muted-foreground mb-2 md:mb-3 font-semibold">Current Bid</p>
                <div className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-secondary mb-2 md:mb-4 break-words">
                  {currentBid} Pts.
                </div>
                {leadingTeamName && (
                  <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-2">
                    {leadingTeamLogo && (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden border-2 md:border-3 border-primary shadow-lg flex items-center justify-center bg-transparent flex-shrink-0">
                        <img
                          src={leadingTeamLogo}
                          alt={leadingTeamName}
                          className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 object-contain"
                          onError={(e) => {
                            e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(leadingTeamName || 'Team')}&backgroundColor=6366f1,8b5cf6,ec4899&backgroundType=gradientLinear&fontSize=36&fontWeight=600`;
                          }}
                        />
                      </div>
                    )}
                    <div className="text-base sm:text-lg md:text-3xl lg:text-4xl xl:text-5xl font-black text-primary break-words">
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

            <div className="max-w-[70%] text-right flex gap-1 justify-end">
              {player.auctionSerialNumber && (
                <Badge variant="outline" className="text-xs font-bold shadow-sm whitespace-nowrap bg-background/50 border-primary/50">
                  #{player.auctionSerialNumber}
                </Badge>
              )}
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
