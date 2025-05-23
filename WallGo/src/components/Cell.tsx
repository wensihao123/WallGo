import React from 'react';
import { BLUE_EDGE_COLOR, CELL_SIZE, RED_EDGE_COLOR } from '../constants';
import { useGameContext } from '../context/GameContext';

interface CellProps {
  row: number;
  col: number;
}

const regionColors = [
  '#ffeeb1', '#81c784', '#64b5f6', '#ffd54f', '#ba68c8', '#4db6ac', '#f06292',
  '#7986cb', '#a1887f', '#90a4ae', '#ffb74d', '#4fc3f7', '#aed581', '#ff8a65'
];

export const Cell: React.FC<CellProps> = ({ row, col }) => {
   const { completedCells, gamePhase, playerPieces, addPiece } = useGameContext();
  const regionId = completedCells[row][col];
  const backgroundColor = regionId >= 0 ? regionColors[regionId % regionColors.length] : undefined;

    const handleClick = () => {
    if (gamePhase === 'placement') {
      const currentPlayer = playerPieces[0].length <= playerPieces[1].length ? 0 : 1;
      addPiece(currentPlayer, row, col);
    }
  };

  const piece = Object.entries(playerPieces).find(([, pieces]) =>
    pieces.some(p => p.row === row && p.col === col)
  );

  const pieceColor = piece ? (piece[0] === '0' ? RED_EDGE_COLOR : BLUE_EDGE_COLOR) : null;

  return (
    <div
      className="cell"
      onClick={handleClick}
      style={{
        top: row * CELL_SIZE,
        left: col * CELL_SIZE,
        backgroundColor,
        position: 'absolute',
        width: CELL_SIZE,
        height: CELL_SIZE
      }}
    >
      {pieceColor && (
        <div
          style={{
            width: CELL_SIZE * 0.7,
            height: CELL_SIZE * 0.7,
            backgroundColor: pieceColor,
            borderRadius: '50%',
            margin: 'auto',
            transform: 'translateY(15%)'
          }}
        />
      )}
    </div>
  );
};
