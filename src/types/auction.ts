export type PlayerSkill = "Batsman" | "Bowler" | "All-Rounder" | "Wicket-Keeper";

export type PlayerStatus = "Unsold" | "Sold";

export interface Player {
  amtSold: ReactNode;
  id: string;
  name: string;
  skill: PlayerSkill;
  basePrice: number;
  soldPrice?: number;
  status: PlayerStatus;
  teamId?: string;
  photo: string;
}

export interface Team {
  id: string;
  name: string;
  logo: string;
  totalBudget: number;
  spentBudget: number;
  maxPlayers: number;
  currentPlayers: number;
  color: string;
}

export interface AuctionState {
  currentPlayer: Player | null;
  currentBid: number;
  currentTeam: string | null;
  isActive: boolean;
}
