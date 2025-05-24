import React from 'react';
import { useResponsiveSize } from '../hooks/useResponsiveSize';

interface CornerProps {
  row: number;
  col: number;
}

export const Corner: React.FC<CornerProps> = ({ row, col }) => {
  const { cellSize, edgeThickness } = useResponsiveSize();

  return (
    <div
      className="corner"
      style={{
        position: 'absolute',
        top: row * cellSize - edgeThickness / 2,
        left: col * cellSize - edgeThickness / 2,
        width: edgeThickness,
        height: edgeThickness,
        backgroundColor: '#e6e6e6',
        boxSizing: 'border-box',
      }}
    />
  );
};