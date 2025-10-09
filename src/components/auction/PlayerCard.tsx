import { Player } from "@/types/auction";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import placeholderImg from "@/assets/player-placeholder.jpg";

interface PlayerCardProps {
  player: Player;
  isAnimated?: boolean;
  isSold?: boolean;
  className?: string;
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


export const PlayerCard = ({ player, isAnimated, isSold, className }: PlayerCardProps) => {
  // console.log("Rendering PlayerCard for:", player);
  const formatPrice = (price: number) => {
    return `₹${(price / 100000).toFixed(1)}L`;
  };

  const logoSrc = getDriveThumbnail(player.photo as unknown as string);

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
          // src={placeholderImage}
          // src = 'https://drive.google.com/open?id=1jrlVLLlWK_Ji5-4MeadsY5b9xBbwSUBa'
          // src = 'https://drive.google.com/uc?export=view&id=1jrlVLLlWK_Ji5-4MeadsY5b9xBbwSUBa'
          // src="https://drive.google.com/thumbnail?id=1jrlVLLlWK_Ji5-4MeadsY5b9xBbwSUBa"
          src={logoSrc}

          alt={player.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
        
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
        {/* Derived status badge: Sold / Unsold / Remaining */}
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

      {/* Player Details */}
      <div className="p-6 space-y-4">
        <h3 className="text-6xl font-black text-foreground text-center">{player.name}</h3>

        {/* Team name when player is sold */}
        {player.teamName && (
          <p className="text-sm text-muted-foreground text-center">Sold to <span className="font-bold text-foreground">{player.teamName}</span></p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Base Price</p>
            <p className="text-lg font-bold text-foreground">
              {player.basePrice !== undefined ? formatPrice(player.basePrice) : "-"}
            </p>
          </div>

          {player.amtSold > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Sold Price</p>
              <p className="text-lg font-bold text-secondary">
                {player.amtSold !== undefined ? formatPrice(player.amtSold) : "-"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
