import React from 'react';
import { useGameContext } from '../context/GameContext';
import styles from './Indicator.module.css';

export const Indicator: React.FC = () => {
  const { 
    gamePhase, 
    playerPieces, 
    currentMovePlayer, 
    movesRemaining, 
    selectedPiece,
    lastMovedPiece,
    skipRemainingMoves  // 新增
  } = useGameContext();

  if (gamePhase === 'placement') {
    const currentPlayer = playerPieces[0].length <= playerPieces[1].length ? '红方' : '蓝方';
    const redCount = playerPieces[0].length;
    const blueCount = playerPieces[1].length;
    const isRedTurn = currentPlayer === '红方';
    
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.phaseTitle}>
            🎯 棋子放置阶段
          </div>
          <div className={`${styles.currentPlayer} ${isRedTurn ? styles.currentPlayerRed : styles.currentPlayerBlue}`}>
            当前: {currentPlayer}
          </div>
        </div>
        <div className={styles.placementStats}>
          <span className={styles.redCount}>
            🔴 红方: {redCount}/4
          </span>
          <span className={styles.blueCount}>
            🔵 蓝方: {blueCount}/4
          </span>
        </div>
      </div>
    );
  } else if (gamePhase === 'wallPlacement') {
    const currentPlayerName = currentMovePlayer === 0 ? '红方' : '蓝方';
    const isRedTurn = currentMovePlayer === 0;
    
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.phaseTitle}>
            🧱 墙壁放置阶段
          </div>
          <div className={`${styles.currentPlayer} ${isRedTurn ? styles.currentPlayerRed : styles.currentPlayerBlue}`}>
            {currentPlayerName}
          </div>
        </div>
        <div className={styles.movementInfo}>
          <span className={styles.movesRemaining}>
            🎯 在移动棋子周围放置墙壁
          </span>
          {lastMovedPiece && (
            <span className={styles.selectedPiece}>
              📍 参考位置: ({lastMovedPiece.row}, {lastMovedPiece.col})
            </span>
          )}
        </div>
      </div>
    );
  } else {
    const currentPlayerName = currentMovePlayer === 0 ? '红方' : '蓝方';
    const isRedTurn = currentMovePlayer === 0;
    const selectedPieceInfo = selectedPiece ? 
      `已选择 #${selectedPiece.pieceIndex + 1}` : 
      '选择棋子';
    
    // 新增：判断是否可以跳过移动
    const canSkipMoves = movesRemaining === 1 && lastMovedPiece;
    
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.phaseTitle}>
            ⚡ 移动阶段
          </div>
          <div className={`${styles.currentPlayer} ${isRedTurn ? styles.currentPlayerRed : styles.currentPlayerBlue}`}>
            {currentPlayerName}
          </div>
        </div>
        <div className={styles.movementInfo}>
          <span className={styles.movesRemaining}>
            🎯 移动: {movesRemaining}/2
          </span>
          {canSkipMoves && (
          <div className={styles.movementInfo}>
            <button 
              onClick={skipRemainingMoves}
              className={styles.movesRemaining}
            >
                结束移动阶段
            </button>
          </div>
        )}
          <span className={`${styles.selectedPiece} ${selectedPiece ? styles.selectedPieceActive : styles.selectedPieceInactive}`}>
            {selectedPiece ? `✅ ${selectedPieceInfo}` : `👆 ${selectedPieceInfo}`}
          </span>
        </div>
      </div>
    );
  }
};
