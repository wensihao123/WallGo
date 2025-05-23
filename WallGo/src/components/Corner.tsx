import React from 'react';
import { CELL_SIZE, EDGE_THICKNESS } from '../constants';

interface CornerProps {
  row: number;
  col: number;
}

export const Corner: React.FC<CornerProps> = ({ row, col }) => (
  <div
    className="corner"
    style={{
      top: row * CELL_SIZE - EDGE_THICKNESS / 2,
      left: col * CELL_SIZE - EDGE_THICKNESS / 2,
    }}
  />
);