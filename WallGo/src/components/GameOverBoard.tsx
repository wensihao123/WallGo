import React from 'react';
import { useGameContext } from '../context/GameContext';
import styles from './GameOverBoard.module.css';

export const GameOverModal: React.FC = () => {
  const { gamePhase, winner, redScore, blueScore, restartGame } = useGameContext();

  if (gamePhase !== 'gameOver') return null;

  const getWinnerText = () => {
    if (winner === null) return '平局！';
    return winner === 0 ? '🔴 红方胜利！' : '🔵 蓝方胜利！';
  };

  const getWinnerClass = () => {
    if (winner === null) return styles.draw;
    return winner === 0 ? styles.redWinner : styles.blueWinner;
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={`${styles.title} ${getWinnerClass()}`}>
            🎉 游戏结束 🎉
          </h2>
        </div>
        
        <div className={styles.content}>
          <div className={`${styles.winnerAnnouncement} ${getWinnerClass()}`}>
            {getWinnerText()}
          </div>
          
          <div className={styles.scoreSection}>
            <h3>最终得分</h3>
            <div className={styles.scores}>
              <div className={`${styles.scoreItem} ${styles.redScore}`}>
                <span className={styles.playerName}>🔴 红方</span>
                <span className={styles.score}>{redScore} 格</span>
              </div>
              <div className={styles.vs}>VS</div>
              <div className={`${styles.scoreItem} ${styles.blueScore}`}>
                <span className={styles.playerName}>🔵 蓝方</span>
                <span className={styles.score}>{blueScore} 格</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.footer}>
          <button 
            className={styles.restartButton}
            onClick={restartGame}
          >
            重新开始
          </button>
        </div>
      </div>
    </div>
  );
};