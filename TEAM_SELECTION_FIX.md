# Team Selection Fix - PlayerDetailsModal

## Issue
The team dropdown in PlayerDetailsModal was showing teams based on the globally selected tournament (from localStorage), not the tournament that the player actually belongs to.

## Problem Scenario
1. User selects Tournament A from the Tournaments page
2. localStorage stores Tournament A's ID
3. User views a player from Tournament B
4. Team dropdown incorrectly shows teams from Tournament A instead of Tournament B

## Solution
Changed the team fetching logic to use the **player's tournament ID** (`player.touranmentId`) instead of the globally selected tournament ID.

## Changes Made

### File: `PlayerDetailsModal.tsx`

#### Before:
```typescript
useEffect(() => {
  const fetchTeams = async () => {
    try {
      const tournamentId = getSelectedTournamentId(); // ❌ Wrong: uses global selection
      const response = await fetch(`${apiConfig.baseUrl}/api/team/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          touranmentId: tournamentId,
        }),
      });
      // ...
    }
  };

  if (isOpen) {
    fetchTeams();
  }
}, [isOpen]);
```

#### After:
```typescript
useEffect(() => {
  const fetchTeams = async () => {
    if (!player?.touranmentId) { // ✅ Validate player has tournament ID
      console.warn("Player has no tournament ID");
      return;
    }

    try {
      const response = await fetch(`${apiConfig.baseUrl}/api/team/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          touranmentId: player.touranmentId, // ✅ Correct: uses player's tournament
        }),
      });
      // ...
    }
  };

  if (isOpen && player) { // ✅ Added player to condition
    fetchTeams();
  }
}, [isOpen, player]); // ✅ Added player to dependencies
```

#### Removed Import:
```typescript
// Removed this line as it's no longer needed:
import { getSelectedTournamentId } from "@/lib/tournamentUtils";
```

## Benefits

1. **Correct Team List**: Shows only teams from the player's actual tournament
2. **Cross-Tournament Support**: Works correctly when viewing players from different tournaments
3. **Data Integrity**: Prevents assigning players to teams from wrong tournaments
4. **Better Validation**: Added check for missing tournament ID

## How It Works Now

```
Player Modal Opens
    ↓
Check if player has touranmentId
    ↓
Fetch teams from player.touranmentId
    ↓
Display teams in dropdown
    ↓
User can only select teams from correct tournament
```

## Example Scenario

**Tournament A:**
- Teams: Mumbai Indians, Chennai Super Kings
- Player: Virat Kohli (touranmentId: A)

**Tournament B:**
- Teams: Delhi Capitals, Royal Challengers
- Player: Rohit Sharma (touranmentId: B)

**Before Fix:**
- If Tournament B is selected globally
- Opening Virat Kohli's modal would show Delhi Capitals, Royal Challengers ❌

**After Fix:**
- Opening Virat Kohli's modal shows Mumbai Indians, Chennai Super Kings ✅
- Opening Rohit Sharma's modal shows Delhi Capitals, Royal Challengers ✅

## Edge Cases Handled

1. **Missing Tournament ID**: Shows warning in console, doesn't crash
2. **Player is null**: useEffect doesn't run
3. **API Failure**: Caught and logged, empty teams array

## Testing

1. ✅ Build successful
2. ✅ No TypeScript errors
3. ✅ Proper dependency array in useEffect
4. ✅ Validation for missing data

## Impact

- **Low Risk**: Only affects team dropdown in edit mode
- **High Value**: Prevents data corruption from incorrect team assignments
- **No Breaking Changes**: Existing functionality preserved

---

**Date**: 17 October 2025
**Status**: ✅ Complete
**Build**: Successful (566.14 kB)
