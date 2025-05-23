import React from 'react';
import { useGameContext } from '../context/GameContext';

export const Indicator: React.FC = () => {
  const { gamePhase, playerPieces } = useGameContext();

  const currentPlayer = playerPieces[0].length <= playerPieces[1].length ? '红方' : '蓝方';
  const phaseLabel = gamePhase === 'placement' ? '棋子放置阶段' : '移动阶段';

  return (
    <div style={{ padding: '10px', fontSize: '20px' }}>
      <strong>{phaseLabel}</strong> - 当前玩家：{currentPlayer}
    </div>
  );
};