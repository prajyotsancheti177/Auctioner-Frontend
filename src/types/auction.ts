export type PlayerSkill = "Batsman" | "Bowler" | "All-Rounder" | "Wicket-Keeper";

export type PlayerStatus = "Unsold" | "Sold";

export interface Player {
  _id?: string;
  id?: string;
  name: string;
  age?: number;
  photo?: string;
  skills?: PlayerSkill[];
  mobile?: number | string;
  email?: string | null;
  address?: string | null;
  touranmentId?: string;
  teamId?: string;
  teamName?: string;
  sold?: boolean;
  auctionStatus?: boolean;
  basePrice?: number;
  amtSold?: number;
  playerCategory?: string;
  status?: PlayerStatus;
}

export interface Team {
  _id?: string;
  id?: string;
  name: string;
  logo?: string;
  owner?: {
    name?: string;
    email?: string | null;
    mobile?: string | null;
  };
  players?: Player[];
  totalSpent?: number;
  remainingBudget?: number;
  maxPlayersPerTeam?: number;
  playersCount?: number;
  maxBiddableAmount?: number;
}

export interface AuctionState {
  currentPlayer: Player | null;
  currentBid: number;
  currentTeam: string | null;
  isActive: boolean;
}
