import React from 'react';
import { BLUE_EDGE_COLOR, RED_EDGE_COLOR } from '../constants';
import { useGameContext } from '../context/GameContext';
import { useResponsiveSize } from '../hooks/useResponsiveSize';
import styles from './Cell.module.css';

interface CellProps {
  row: number;
  col: number;
}

// 基础色、淡红色、淡蓝色
const baseColor = '#f0f0f0';
const lightRedColor = '#ffcdd2';
const lightBlueColor = '#bbdefb';

export const Cell: React.FC<CellProps> = ({ row, col }) => {
  const { 
    completedCells, 
    gamePhase, 
    playerPieces, 
    addPiece, 
    selectPiece, 
    movePiece, 
    selectedPiece,
    currentMovePlayer,
    playerWalls
  } = useGameContext();
  const { cellSize } = useResponsiveSize();
  const regionId = completedCells[row][col];
  
  // 计算区域颜色
  const getRegionColor = () => {
    if (regionId < 0) return baseColor; // 未形成区域时使用基础色
    
    // 统计当前区域内的棋子
    let hasRedPiece = false;
    let hasBluePiece = false;
    
    // 遍历所有格子，找到相同区域的格子
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (completedCells[r][c] === regionId) {
          // 检查这个格子是否有棋子
          const redPiece = playerPieces[0].find(p => p.row === r && p.col === c);
          const bluePiece = playerPieces[1].find(p => p.row === r && p.col === c);
          
          if (redPiece) hasRedPiece = true;
          if (bluePiece) hasBluePiece = true;
        }
      }
    }
    
    // 根据棋子情况决定颜色
    if (hasRedPiece && hasBluePiece) {
      return baseColor; // 同时有红蓝棋子，使用基础色
    } else if (hasRedPiece) {
      return lightRedColor; // 只有红色棋子，使用淡红色
    } else if (hasBluePiece) {
      return lightBlueColor; // 只有蓝色棋子，使用淡蓝色
    } else {
      return baseColor; // 没有棋子，使用基础色
    }
  };
  
  const backgroundColor = getRegionColor();

  // Find which piece (if any) is on this cell
  const pieceInfo = Object.entries(playerPieces).reduce<{
    player: number;
    pieceIndex: number;
    piece: { row: number; col: number };
  } | null>((found, [playerStr, pieces]) => {
    if (found) return found;
    const pieceIndex = pieces.findIndex(p => p.row === row && p.col === col);
    if (pieceIndex !== -1) {
      return {
        player: parseInt(playerStr) as 0 | 1,
        pieceIndex,
        piece: pieces[pieceIndex]
      };
    }
    return null;
  }, null);

  // Check if two cells are connected (not blocked by walls)
  const areCellsConnected = (fromRow: number, fromCol: number, toRow: number, toCol: number): boolean => {
    // Must be adjacent cells
    const rowDiff = Math.abs(fromRow - toRow);
    const colDiff = Math.abs(fromCol - toCol);
    if (rowDiff + colDiff !== 1) return false;

    const allWalls = playerWalls[0].concat(playerWalls[1]);
    
    // Check if there's a wall blocking the movement
    if (fromRow === toRow) {
      // Horizontal movement
      const minCol = Math.min(fromCol, toCol);
      const wallCol = minCol + 1;
      return !allWalls.some(wall => 
        wall.type === 'v' && wall.row === fromRow && wall.col === wallCol
      );
    } else {
      // Vertical movement
      const minRow = Math.min(fromRow, toRow);
      const wallRow = minRow + 1;
      return !allWalls.some(wall => 
        wall.type === 'h' && wall.row === wallRow && wall.col === fromCol
      );
    }
  };

  const handleClick = () => {
    if (gamePhase === 'placement') {
      const currentPlayer = playerPieces[0].length <= playerPieces[1].length ? 0 : 1;
      addPiece(currentPlayer, row, col);
    } else if (gamePhase === 'movement') {
      if (pieceInfo) {
        if (pieceInfo.player === currentMovePlayer) {
          selectPiece(pieceInfo.player, pieceInfo.pieceIndex);
        }
      } else if (selectedPiece) {
        const selectedPlayerPiece = playerPieces[selectedPiece.player][selectedPiece.pieceIndex];
        if (selectedPlayerPiece) {
          movePiece(selectedPlayerPiece.row, selectedPlayerPiece.col, row, col);
        }
      }
    }
  };

  // Determine piece color and selection state
  const pieceColor = pieceInfo ? (pieceInfo.player === 0 ? RED_EDGE_COLOR : BLUE_EDGE_COLOR) : null;
  const isSelected = selectedPiece && 
    pieceInfo && 
    selectedPiece.player === pieceInfo.player && 
    selectedPiece.pieceIndex === pieceInfo.pieceIndex;

  // Check if this cell is a valid move target
  const isValidMoveTarget = gamePhase === 'movement' && 
    selectedPiece && 
    !pieceInfo && 
    (() => {
      const selectedPlayerPiece = playerPieces[selectedPiece.player][selectedPiece.pieceIndex];
      if (!selectedPlayerPiece) return false;
      
      // Check if cells are adjacent and connected (not blocked by walls)
      return areCellsConnected(selectedPlayerPiece.row, selectedPlayerPiece.col, row, col);
    })();

  // Determine cursor style
  const getCursorClass = () => {
    if (gamePhase === 'placement') return styles.cellPlacement;
    if (pieceInfo && pieceInfo.player === currentMovePlayer) return styles.cellMovementPiece;
    if (isValidMoveTarget) return styles.cellMovementTarget;
    return styles.cellDefault;
  };

  return (
    <div
      className={`${styles.cell} ${getCursorClass()} ${isValidMoveTarget ? styles.validMoveTarget : ''}`}
      onClick={handleClick}
      style={{
        top: row * cellSize,
        left: col * cellSize,
        backgroundColor,
        width: cellSize,
        height: cellSize,
      }}
    >
      {pieceColor && (
        <div
          className={`${styles.piece} ${isSelected ? styles.pieceSelected : ''}`}
          style={{
            width: cellSize * 0.7,
            height: cellSize * 0.7,
            backgroundColor: pieceColor,
          }}
        />
      )}
      
      {/* 可移动位置的指示器 */}
      {isValidMoveTarget && (
        <div className={styles.moveIndicator} />
      )}
    </div>
  );
};