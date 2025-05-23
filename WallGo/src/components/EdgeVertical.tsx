import React, { useState } from "react";
import { BLUE_EDGE_COLOR, CELL_SIZE, EDGE_THICKNESS, RED_EDGE_COLOR } from "../constants";
import { useGameContext } from '../context/GameContext';

interface EdgeProps {
  row: number;
  col: number;
  currentPlayer: number;
  onClaim: () => void;
}

export const EdgeVertical: React.FC<EdgeProps> = ({ row, col, currentPlayer, onClaim }) => {
  const [player, setPlayer] = useState<number | null>(null);
  const { addWallAndUpdate } = useGameContext();

  const handleClick = () => {
    if (player === null) {
      setPlayer(currentPlayer);
      addWallAndUpdate(currentPlayer as 0 | 1, { type: 'v', row, col });
      onClaim();
    }
  };

  return (
    <div
      className="edge-v"
      style={{
        top: row * CELL_SIZE,
        left: col * CELL_SIZE - EDGE_THICKNESS / 2,
        backgroundColor:
          player === 0 ? RED_EDGE_COLOR : player === 1 ? BLUE_EDGE_COLOR : undefined,
      }}
      onClick={handleClick}
    />
  );
};
