import React from 'react';
import { useGameContext } from '../context/GameContext';

export const DebugPanel: React.FC = () => {
  const { playerWalls } = useGameContext();

  return (
    <div className="debug-panel">
      <h3>调试面板</h3>
      <div>
        <strong>红方（0）墙数：</strong> {playerWalls[0].length}
        <ul>
          {playerWalls[0].map((edge, i) => (
            <li key={i}>{edge.type}({edge.row},{edge.col})</li>
          ))}
        </ul>
      </div>
      <div>
        <strong>蓝方（1）墙数：</strong> {playerWalls[1].length}
        <ul>
          {playerWalls[1].map((edge, i) => (
            <li key={i}>{edge.type}({edge.row},{edge.col})</li>
          ))}
        </ul>
      </div>
    </div>
  );
};