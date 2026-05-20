import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useOverlaySocket } from "@/hooks/useOverlaySocket";
import {
  getTeamColor,
  formatOverlayPrice,
  getPlayerPhotoUrl,
  getFallbackAvatar,
  getTeamFallbackAvatar,
} from "@/lib/overlayUtils";
import { getDriveThumbnail } from "@/lib/imageUtils";
import "./overlays.css";

/**
 * Layout 1 — Camera with HUD (Lower Third)
 *
 * Transparent background with a lower-third panel showing:
 * - Player name, category, skill
 * - Base price and current bid
 * - Leading team name + logo
 *
 * Designed for OBS Browser Source at 1920×1080.
 * The host's camera feed shows behind this overlay.
 */
const CameraHudOverlay = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const {
    isConnected,
    auctionState,
    soldEvent,
    unsoldEvent,
    lastBid,
    clearSoldEvent,
    clearUnsoldEvent,
  } = useOverlaySocket(tournamentId);

  const [showPanel, setShowPanel] = useState(false);
  const [showSold, setShowSold] = useState(false);
  const [showUnsold, setShowUnsold] = useState(false);
  const [bidPulse, setBidPulse] = useState(false);
  const [playerKey, setPlayerKey] = useState(0);
  const prevPlayerRef = useRef<string | null>(null);

  // Force transparent background via CSS class for OBS Browser Source
  useEffect(() => {
    document.body.classList.add("overlay-mode");
    return () => {
      document.body.classList.remove("overlay-mode");
    };
  }, []);

  const currentPlayer = auctionState?.currentPlayer || null;
  const currentBid = auctionState?.currentBid || 0;
  const leadingTeam = auctionState?.leadingTeam || null;
  const teams = auctionState?.teams || [];
  const bidPrice = auctionState?.bidPrice || 0;

  const leadingTeamData = teams.find((t) => t._id === leadingTeam);
  const teamColor = leadingTeamData
    ? getTeamColor(leadingTeamData.name || leadingTeamData._id || "")
    : "#6366f1";

  // Show/hide panel when player changes
  useEffect(() => {
    if (currentPlayer) {
      const newPlayerId = currentPlayer._id || currentPlayer.name;
      if (newPlayerId !== prevPlayerRef.current) {
        setShowPanel(false);
        setTimeout(() => {
          setPlayerKey((k) => k + 1);
          setShowPanel(true);
        }, 100);
        prevPlayerRef.current = newPlayerId;
      }
    } else {
      setShowPanel(false);
      prevPlayerRef.current = null;
    }
  }, [currentPlayer]);

  // Bid pulse animation
  useEffect(() => {
    if (lastBid) {
      setBidPulse(true);
      const t = setTimeout(() => setBidPulse(false), 400);
      return () => clearTimeout(t);
    }
  }, [lastBid]);

  // SOLD animation
  useEffect(() => {
    if (soldEvent) {
      setShowSold(true);
      const t = setTimeout(() => {
        setShowSold(false);
        setShowPanel(false);
        clearSoldEvent();
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [soldEvent, clearSoldEvent]);

  // UNSOLD animation
  useEffect(() => {
    if (unsoldEvent) {
      setShowUnsold(true);
      const t = setTimeout(() => {
        setShowUnsold(false);
        setShowPanel(false);
        clearUnsoldEvent();
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [unsoldEvent, clearUnsoldEvent]);

  return (
    <div className="overlay-root overlay-transparent">
      {/* Lower Third Panel - Compact Centered Pill */}
      {showPanel && currentPlayer && (
        <div
          style={{
            position: "absolute",
            bottom: 48,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div
            key={playerKey}
            className="anim-slide-up overlay-glass"
            style={{
              padding: "20px 40px 20px 20px",
              display: "flex",
              alignItems: "center",
              gap: 40,
              borderBottom: `6px solid ${teamColor}`,
              borderRadius: "100px", // fully rounded pill
              background: "rgba(15, 10, 30, 0.95)",
              boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 40px ${teamColor}30`,
              maxWidth: "95%",
            }}
          >
            {/* 1. Player Photo (Circular) */}
            <img
              src={getPlayerPhotoUrl(currentPlayer)}
              alt={currentPlayer.name}
              onError={(e) => {
                e.currentTarget.src = getFallbackAvatar(currentPlayer.name);
              }}
              style={{
                width: 130,
                height: 130,
                borderRadius: "50%",
                objectFit: "cover",
                objectPosition: "top center",
                border: `4px solid ${teamColor}`,
                flexShrink: 0,
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              }}
            />

            {/* 2. Player Name & Badges */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 280, maxWidth: 450 }}>
              <div
                style={{
                  fontSize: 44,
                  fontWeight: 900,
                  letterSpacing: -1,
                  lineHeight: 1.1,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {currentPlayer.auctionSerialNumber && (
                  <span style={{ color: "rgba(255,255,255,0.4)", marginRight: 12 }}>
                    #{currentPlayer.auctionSerialNumber}
                  </span>
                )}
                {currentPlayer.name}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                {currentPlayer.playerCategory && (
                  <span className="overlay-category-badge" style={{ fontSize: 15, padding: "4px 16px" }}>
                    {currentPlayer.playerCategory}
                  </span>
                )}
                {currentPlayer.skill && (
                  <span className="overlay-skill-badge" style={{ fontSize: 15, padding: "4px 16px" }}>
                    {currentPlayer.skill}
                  </span>
                )}
              </div>
            </div>

            {/* Divider */}
            <div style={{ width: 2, height: 80, background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.2), transparent)" }} />

            {/* 3. Base Price & Increment */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 160 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: 2, marginBottom: 4 }}>
                  BASE PRICE
                </div>
                <div style={{ fontSize: 28, fontWeight: 800 }}>
                  {currentPlayer.basePrice ?? 0} <span style={{ fontSize: 20, color: "rgba(255,255,255,0.6)" }}>Pts.</span>
                </div>
              </div>
              {bidPrice > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: 1, marginBottom: 2 }}>
                    NEXT INCREMENT
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: "#fbbf24" }}>
                    +{bidPrice} Pts.
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div style={{ width: 2, height: 80, background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.2), transparent)" }} />

            {/* 4. Current Bid & Team */}
            <div style={{ textAlign: "right", minWidth: 260 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: 3, marginBottom: 4 }}>
                CURRENT BID
              </div>
              <div
                className={`overlay-bid-amount ${bidPulse ? "anim-bid-pulse" : ""}`}
                style={{ fontSize: 68, marginBottom: 8 }}
              >
                {currentBid} <span style={{ fontSize: 40 }}>Pts.</span>
              </div>
              
              {leadingTeamData ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      fontSize: 24,
                      fontWeight: 800,
                      color: teamColor,
                      textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                    }}
                  >
                    {leadingTeamData.name}
                  </span>
                  <img
                    src={getDriveThumbnail(leadingTeamData.logo)}
                    alt={leadingTeamData.name}
                    className="overlay-team-logo-sm"
                    style={{ width: 36, height: 36 }}
                    onError={(e) => {
                      e.currentTarget.src = getTeamFallbackAvatar(
                        leadingTeamData.name
                      );
                    }}
                  />
                  <span className="overlay-live-dot" />
                </div>
              ) : (
                <div style={{ fontSize: 18, fontStyle: "italic", color: "rgba(255,255,255,0.3)" }}>
                  Waiting for bids...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SOLD Overlay */}
      {showSold && (
        <div className="overlay-sold-container anim-sold-flash">
          <div className="overlay-sold-bg" />
          <div className="overlay-sold-stamp anim-stamp">SOLD!</div>
        </div>
      )}

      {/* UNSOLD Overlay */}
      {showUnsold && (
        <div className="overlay-unsold-container">
          <div className="overlay-unsold-stamp anim-stamp">UNSOLD</div>
        </div>
      )}

      {/* Standby — no player, auction might not be active */}
      {!currentPlayer && !showSold && !showUnsold && (
        <div style={{ position: "absolute", bottom: 40, right: 40 }}>
          <div
            className="overlay-glass"
            style={{
              padding: "16px 32px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              opacity: isConnected ? 0.6 : 0.3,
            }}
          >
            <span
              className="overlay-live-dot"
              style={{
                background: isConnected ? "#22c55e" : "#6b7280",
                boxShadow: isConnected
                  ? "0 0 12px rgba(34, 197, 94, 0.6)"
                  : "none",
              }}
            />
            <span style={{ fontSize: 18, fontWeight: 600 }}>
              {isConnected
                ? auctionState?.isActive
                  ? "LIVE — Waiting for player..."
                  : "Connected — Auction not started"
                : "Connecting..."}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraHudOverlay;
