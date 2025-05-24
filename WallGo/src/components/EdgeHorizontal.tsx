import React, { useState, useEffect } from "react";
import {
  BLUE_EDGE_COLOR,
  RED_EDGE_COLOR,
} from "../constants";
import { useGameContext } from "../context/GameContext";
import { useResponsiveSize } from "../hooks/useResponsiveSize";

interface EdgeProps {
  row: number;
  col: number;
  currentPlayer: number;
  onClaim: () => void;
}

export const EdgeHorizontal: React.FC<EdgeProps> = ({
  row,
  col,
  currentPlayer,
  onClaim,
}) => {
  const [player, setPlayer] = useState<number | null>(null);
  const {
    addWallAndUpdate,
    gamePhase,
    currentMovePlayer,
    lastMovedPiece,
    playerWalls,
    resetKey,
  } = useGameContext();
  const { cellSize, edgeThickness } = useResponsiveSize();

  // Reset player state when game resets
  useEffect(() => {
    setPlayer(null);
  }, [resetKey]);

  // Check if this edge can be placed with a wall
  const canPlaceWall = () => {
    if (
      gamePhase !== "wallPlacement" ||
      currentPlayer !== currentMovePlayer ||
      player !== null
    ) {
      return false;
    }

    // Check if wall already exists
    const allWalls = playerWalls[0].concat(playerWalls[1]);
    const wallExists = allWalls.some(
      (wall) => wall.type === "h" && wall.row === row && wall.col === col
    );
    if (wallExists) return false;

    // Check if it's outer border
    if (row === 0 || row === 7 || col < 0 || col >= 7) return false;

    // Check if this edge is exactly on one of the four borders of the last moved piece
    if (!lastMovedPiece) return false;

    const { row: pieceRow, col: pieceCol } = lastMovedPiece;

    // For horizontal edges, check if it's the top or bottom edge of the piece
    // Top edge: row = pieceRow, col = pieceCol
    // Bottom edge: row = pieceRow + 1, col = pieceCol
    return (
      (row === pieceRow && col === pieceCol) ||
      (row === pieceRow + 1 && col === pieceCol)
    );
  };

  const isWallPlaceable = canPlaceWall();

  const handleClick = () => {
    // 只有在墙壁放置阶段且没有已放置的墙壁时才能点击
    if (gamePhase === "wallPlacement" && player === null) {
      const success = addWallAndUpdate(currentPlayer as 0 | 1, {
        type: "h",
        row,
        col,
      });
      if (success) {
        setPlayer(currentPlayer);
        onClaim();
      }
    }
  };

  const isPlacementPhase = gamePhase === "placement";
  const isWallPlacementPhase = gamePhase === "wallPlacement";
  const canClick = isWallPlacementPhase && player === null;

  return (
    <div
      className="edge-h"
      style={{
        position: 'absolute',
        top: row * cellSize - edgeThickness / 2,
        left: col * cellSize,
        width: cellSize,
        height: edgeThickness,
        backgroundColor:
          player === 0
            ? RED_EDGE_COLOR
            : player === 1
            ? BLUE_EDGE_COLOR
            : undefined,
        cursor: isPlacementPhase
          ? "not-allowed"
          : canClick
          ? "pointer"
          : "default",
      }}
      onClick={handleClick}
    >
      {/* 墙壁放置指示器 */}
      {isWallPlaceable && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: Math.max(6, edgeThickness * 0.6),
            height: Math.max(6, edgeThickness * 0.6),
            borderRadius: "50%",
            backgroundColor: "#d1b4f7",
            opacity: 0.9,
          }}
        />
      )}
    </div>
  );
};
