import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

export type Player = 0 | 1;
export type EdgeType = "h" | "v";
export interface EdgeCoord {
  type: EdgeType;
  row: number;
  col: number;
}

export interface Piece {
  row: number;
  col: number;
}

interface GameContextType {
  playerWalls: Record<Player, EdgeCoord[]>;
  addWallAndUpdate: (player: Player, edge: EdgeCoord) => boolean;
  completedCells: number[][];
  gamePhase: "placement" | "movement" | "wallPlacement" | "gameOver";
  playerPieces: Record<Player, Piece[]>;
  addPiece: (player: Player, row: number, col: number) => void;
  setTitle: (title: string) => void;
  // Movement phase properties
  currentMovePlayer: Player;
  movesRemaining: number;
  selectedPiece: { player: Player; pieceIndex: number } | null;
  movePiece: (
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number
  ) => boolean;
  selectPiece: (player: Player, pieceIndex: number) => void;
  endTurn: () => void;
  lastMovedPiece: { player: number; row: number; col: number } | null;
  // Game over properties
  winner: Player | null;
  redScore: number;
  blueScore: number;
  restartGame: () => void;
    // Reset key to force component remount
  resetKey: number;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [playerWalls, setPlayerWalls] = useState<Record<Player, EdgeCoord[]>>({
    0: [],
    1: [],
  });
  const [resetKey, setResetKey] = useState(0);
  const [completedCells, setCompletedCells] = useState<number[][]>(
    Array.from({ length: 7 }, () => Array(7).fill(-1))
  );

  const [playerPieces, setPlayerPieces] = useState<Record<Player, Piece[]>>({
    0: [],
    1: [],
  });
 const [gamePhase, setGamePhase] = useState<"placement" | "movement" | "wallPlacement" | "gameOver">(
    "placement"
  );
  const [movedPieceInTurn, setMovedPieceInTurn] = useState<{
    player: Player;
    pieceIndex: number;
  } | null>(null);

  // Movement phase state
  const [currentMovePlayer, setCurrentMovePlayer] = useState<Player>(0);
  const [movesRemaining, setMovesRemaining] = useState(2);
  const [selectedPiece, setSelectedPiece] = useState<{
    player: Player;
    pieceIndex: number;
  } | null>(null);
  const [lastMovedPiece, setLastMovedPiece] = useState<{
    player: number;
    row: number;
    col: number;
  } | null>(null);

    // Game over state
  const [winner, setWinner] = useState<Player | null>(null);
  const [redScore, setRedScore] = useState(0);
  const [blueScore, setBlueScore] = useState(0);

  useEffect(() => {
    const title = gamePhase === 'placement' ? '棋子放置阶段' : 
                  gamePhase === 'movement' ? '移动阶段' : 
                  gamePhase === 'wallPlacement' ? '墙壁放置阶段' : '游戏结束';
    document.title = title;
  }, [gamePhase]);

  const isCellReachable = useCallback((targetRow: number, targetCol: number, allWalls: EdgeCoord[]): boolean => {
    // BFS to check if any piece can reach this cell
    const isWall = (type: EdgeType, row: number, col: number) =>
      allWalls.some((e) => e.type === type && e.row === row && e.col === col);

    // Check reachability from any existing piece
    const allPieces = [...playerPieces[0], ...playerPieces[1]];
    
    for (const piece of allPieces) {
      const visited = Array.from({ length: 7 }, () => Array(7).fill(false));
      const queue: [number, number][] = [[piece.row, piece.col]];
      visited[piece.row][piece.col] = true;

      while (queue.length > 0) {
        const [row, col] = queue.shift()!;
        
        if (row === targetRow && col === targetCol) {
          return true; // Found a path
        }

        // Check all 4 directions
        const directions: [number, number, EdgeType, number, number][] = [
          [-1, 0, "h", row, col], // Up
          [1, 0, "h", row + 1, col], // Down  
          [0, -1, "v", row, col], // Left
          [0, 1, "v", row, col + 1], // Right
        ];

        for (const [dr, dc, wallType, wallRow, wallCol] of directions) {
          const newRow = row + dr;
          const newCol = col + dc;
          
          if (
            newRow >= 0 && newRow < 7 && 
            newCol >= 0 && newCol < 7 && 
            !visited[newRow][newCol] &&
            !isWall(wallType, wallRow, wallCol)
          ) {
            visited[newRow][newCol] = true;
            queue.push([newRow, newCol]);
          }
        }
      }
    }
    
    return false; // No path found from any piece
  }, [playerPieces]);

   // Check if game is over and calculate scores
  const checkGameOverWithReachability = useCallback((regionMap: number[][]) => {
    const allWalls = playerWalls[0].concat(playerWalls[1]);
    
    // Count cells by color, excluding unreachable cells
    let redCells = 0;
    let blueCells = 0;
    let neutralCells = 0;
    let unreachableCells = 0;

    // Helper function to get region color
    const getRegionColor = (regionId: number) => {
      if (regionId < 0) return 'neutral';
      
      let hasRedPiece = false;
      let hasBluePiece = false;
      
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (regionMap[r][c] === regionId) {
            const redPiece = playerPieces[0].find(p => p.row === r && p.col === c);
            const bluePiece = playerPieces[1].find(p => p.row === r && p.col === c);
            
            if (redPiece) hasRedPiece = true;
            if (bluePiece) hasBluePiece = true;
          }
        }
      }
      
      if (hasRedPiece && hasBluePiece) return 'neutral';
      if (hasRedPiece) return 'red';
      if (hasBluePiece) return 'blue';
      return 'neutral';
    };

    // Count cells by region color, excluding unreachable ones
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        // Check if this cell is reachable
        if (!isCellReachable(r, c, allWalls)) {
          unreachableCells++;
          continue; // Skip unreachable cells
        }
        
        const regionId = regionMap[r][c];
        const regionColor = getRegionColor(regionId);
        
        if (regionColor === 'red') {
          redCells++;
        } else if (regionColor === 'blue') {
          blueCells++;
        } else {
          neutralCells++;
        }
      }
    }

    setRedScore(redCells);
    setBlueScore(blueCells);

    console.log(`游戏状态: 红${redCells} 蓝${blueCells} 中性${neutralCells} 不可达${unreachableCells}`);

    // Game is over when all reachable cells are colored (no neutral reachable cells)
    if (neutralCells === 0) {
      if (redCells > blueCells) {
        setWinner(0);
      } else if (blueCells > redCells) {
        setWinner(1);
      } else {
        setWinner(null); // Draw
      }
      setGamePhase('gameOver');
      return true;
    }

    return false;
  }, [playerPieces, playerWalls, isCellReachable]);

  // Reset game to initial state
  const restartGame = useCallback(() => {
    setPlayerWalls({ 0: [], 1: [] });
    setCompletedCells(Array.from({ length: 7 }, () => Array(7).fill(-1)));
    setPlayerPieces({ 0: [], 1: [] });
    setGamePhase("placement");
    setMovedPieceInTurn(null);
    setCurrentMovePlayer(0);
    setMovesRemaining(2);
    setSelectedPiece(null);
    setLastMovedPiece(null);
    setWinner(null);
    setRedScore(0);
    setBlueScore(0);
    // Force remount of all components to reset their local state
    setResetKey(prev => prev + 1);
  }, []);

  // Check if an edge is on the outer border
  const isOuterBorder = useCallback((edge: EdgeCoord): boolean => {
    const { type, row, col } = edge;
    if (type === "h") {
      return row === 0 || row === 7 || col < 0 || col >= 7;
    } else {
      return col === 0 || col === 7 || row < 0 || row >= 7;
    }
  }, []);

  // Check if an edge is adjacent to the last moved piece
  const isEdgeAdjacentToLastMoved = useCallback(
    (edge: EdgeCoord): boolean => {
      if (!lastMovedPiece) return false;

      const { row: pieceRow, col: pieceCol } = lastMovedPiece;
      const { type, row: edgeRow, col: edgeCol } = edge;

      if (type === "h") {
        // 水平墙壁检查：只能是棋子的上边或下边
        return (
          (edgeRow === pieceRow && edgeCol === pieceCol) ||
          (edgeRow === pieceRow + 1 && edgeCol === pieceCol)
        );
      } else {
        // 垂直墙壁检查：只能是棋子的左边或右边
        return (
          (edgeCol === pieceCol && edgeRow === pieceRow) ||
          (edgeCol === pieceCol + 1 && edgeRow === pieceRow)
        );
      }
    },
    [lastMovedPiece]
  );

  // Check if two cells are connected (not blocked by walls)
  const areCellsConnected = useCallback(
    (
      fromRow: number,
      fromCol: number,
      toRow: number,
      toCol: number
    ): boolean => {
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
        return !allWalls.some(
          (wall) =>
            wall.type === "v" && wall.row === fromRow && wall.col === wallCol
        );
      } else {
        // Vertical movement
        const minRow = Math.min(fromRow, toRow);
        const wallRow = minRow + 1;
        return !allWalls.some(
          (wall) =>
            wall.type === "h" && wall.row === wallRow && wall.col === fromCol
        );
      }
    },
    [playerWalls]
  );

  // Check if a cell is occupied by any piece
  const isCellOccupied = useCallback(
    (row: number, col: number): boolean => {
      return (
        playerPieces[0].some((p) => p.row === row && p.col === col) ||
        playerPieces[1].some((p) => p.row === row && p.col === col)
      );
    },
    [playerPieces]
  );

  const addWallAndUpdate = useCallback(
    (player: Player, edge: EdgeCoord): boolean => {
      // 只有在墙壁放置阶段才能添加墙壁
      if (gamePhase !== "wallPlacement") {
        console.log("只能在墙壁放置阶段添加墙壁");
        return false;
      }

      // 墙壁放置阶段只能是当前玩家放置墙壁
      if (player !== currentMovePlayer) {
        console.log("只能在自己的回合放置墙壁");
        return false;
      }

      // 检查是否在最外围
      if (isOuterBorder(edge)) {
        console.log("不能在最外围放置墙壁");
        return false;
      }

      // 检查是否在最后移动棋子的周围
      if (!isEdgeAdjacentToLastMoved(edge)) {
        console.log("墙壁必须放置在最后移动的棋子周围");
        return false;
      }

      // 检查墙壁是否已经存在
      const allWalls = playerWalls[0].concat(playerWalls[1]);
      const wallExists = allWalls.some(
        (wall) =>
          wall.type === edge.type &&
          wall.row === edge.row &&
          wall.col === edge.col
      );

      if (wallExists) {
        console.log("此位置已有墙壁");
        return false;
      }

      setPlayerWalls((prev) => {
        const updated = {
          ...prev,
          [player]: [...prev[player], edge],
        };

        const allWalls = updated[0].concat(updated[1]);
        const isWall = (type: EdgeType, row: number, col: number) =>
          allWalls.some(
            (e) => e.type === type && e.row === row && e.col === col
          );

        const visited = Array.from({ length: 7 }, () => Array(7).fill(false));
        const regionMap = Array.from({ length: 7 }, () => Array(7).fill(-1));
        let regionId = 0;

        const dfs = (r: number, c: number) => {
          const stack: [number, number][] = [[r, c]];
          while (stack.length > 0) {
            const [cr, cc] = stack.pop()!;
            if (cr < 0 || cr >= 7 || cc < 0 || cc >= 7 || visited[cr][cc])
              continue;
            visited[cr][cc] = true;
            regionMap[cr][cc] = regionId;

            const directions: [number, number, EdgeType, number, number][] = [
              [-1, 0, "h", cr, cc],
              [1, 0, "h", cr + 1, cc],
              [0, -1, "v", cr, cc],
              [0, 1, "v", cr, cc + 1],
            ];

            for (const [dr, dc, type, wallRow, wallCol] of directions) {
              if (!isWall(type, wallRow, wallCol)) {
                stack.push([cr + dr, cc + dc]);
              }
            }
          }
        };

        for (let r = 0; r < 7; r++) {
          for (let c = 0; c < 7; c++) {
            if (!visited[r][c]) {
              dfs(r, c);
              regionId++;
            }
          }
        }

        setCompletedCells(regionMap);

        // 立即检查游戏是否结束（使用更新后的区域数据）
        setTimeout(() => {
          const gameEnded = checkGameOverWithReachability(regionMap);
          
          if (!gameEnded) {
            // 墙壁放置完成后，切换到下一位玩家的移动阶段
            if (gamePhase === 'wallPlacement') {
              setCurrentMovePlayer(currentMovePlayer === 0 ? 1 : 0);
              setMovesRemaining(2);
              setGamePhase('movement');
              setLastMovedPiece(null);
              setMovedPieceInTurn(null);
            }
          }
        }, 0);

        return updated;
      });

      return true; // 成功放置墙壁
    },
    [gamePhase, currentMovePlayer, lastMovedPiece, playerWalls, playerPieces, isOuterBorder, isEdgeAdjacentToLastMoved]
  );

  const addPiece = (player: Player, row: number, col: number) => {
    setPlayerPieces((prev) => {
      if (gamePhase !== "placement") return prev;
      const alreadyPlaced = prev[0]
        .concat(prev[1])
        .some((p) => p.row === row && p.col === col);
      if (alreadyPlaced || prev[player].length >= 4) return prev;

      const updated = {
        ...prev,
        [player]: [...prev[player], { row, col }],
      };

      if (updated[0].length === 4 && updated[1].length === 4) {
        setGamePhase("movement");
      }

      return updated;
    });
  };

  const selectPiece = useCallback(
    (player: Player, pieceIndex: number) => {
      if (gamePhase !== "movement" || player !== currentMovePlayer) return;

      // If this is the first move (movesRemaining === 2), allow selecting any piece
      if (movesRemaining === 2) {
        if (
          !selectedPiece ||
          (selectedPiece.player === player &&
            selectedPiece.pieceIndex === pieceIndex)
        ) {
          setSelectedPiece(selectedPiece ? null : { player, pieceIndex });
        } else if (selectedPiece.player === player) {
          setSelectedPiece({ player, pieceIndex });
        }
      }
      // If this is the second move (movesRemaining === 1), only allow selecting the same piece that was moved
      else if (movesRemaining === 1) {
        // Only allow selecting the same piece, no switching allowed
        if (
          selectedPiece &&
          selectedPiece.player === player &&
          selectedPiece.pieceIndex === pieceIndex
        ) {
          // Allow deselecting and reselecting the same piece
          setSelectedPiece(null);
          setTimeout(() => setSelectedPiece({ player, pieceIndex }), 0);
        }
        // If no piece is selected, auto-select the piece that was moved in the first step
        else if (!selectedPiece) {
          setSelectedPiece({ player, pieceIndex });
        }
        // Ignore clicks on other pieces
      }
    },
    [gamePhase, currentMovePlayer, selectedPiece, movesRemaining]
  );

  const movePiece = useCallback(
    (
      fromRow: number,
      fromCol: number,
      toRow: number,
      toCol: number
    ): boolean => {
      if (gamePhase !== "movement" || !selectedPiece) return false;

      const { player, pieceIndex } = selectedPiece;
      if (player !== currentMovePlayer) return false;

      // Check if the move is valid
      if (toRow < 0 || toRow >= 7 || toCol < 0 || toCol >= 7) return false;
      if (isCellOccupied(toRow, toCol)) return false;
      if (!areCellsConnected(fromRow, fromCol, toRow, toCol)) return false;

      // Verify the piece being moved is the selected one
      const piece = playerPieces[player][pieceIndex];
      if (!piece || piece.row !== fromRow || piece.col !== fromCol)
        return false;

      // If this is the second move, ensure it's the same piece that was moved first
      if (movesRemaining === 1 && movedPieceInTurn) {
        if (
          movedPieceInTurn.player !== player ||
          movedPieceInTurn.pieceIndex !== pieceIndex
        ) {
          return false;
        }
      }

      // Move the piece
      setPlayerPieces((prev) => {
        const updated = { ...prev };
        updated[player] = [...updated[player]];
        updated[player][pieceIndex] = { row: toRow, col: toCol };
        return updated;
      });

      // Set last moved piece for wall placement reference
      setLastMovedPiece({ player, row: toRow, col: toCol });

      // Track which piece was moved in this turn
      if (movesRemaining === 2) {
        setMovedPieceInTurn({ player, pieceIndex });
      }

      // Decrease moves remaining
      setMovesRemaining((prev) => prev - 1);

      // If no moves remaining, enter wall placement phase
      if (movesRemaining === 1) {
        setGamePhase("wallPlacement");
        setSelectedPiece(null);
        setMovedPieceInTurn(null); // Reset for next turn
      }

      return true;
    },
    [
      gamePhase,
      selectedPiece,
      currentMovePlayer,
      playerPieces,
      movesRemaining,
      movedPieceInTurn,
      isCellOccupied,
      areCellsConnected,
    ]
  );

  const endTurn = useCallback(() => {
    setCurrentMovePlayer((prev) => (prev === 0 ? 1 : 0));
    setMovesRemaining(2);
    setSelectedPiece(null);
  }, []);

  return (
    <GameContext.Provider
      value={{
        playerWalls,
        addWallAndUpdate,
        completedCells,
        gamePhase,
        playerPieces,
        addPiece,
        setTitle: () => {},
        currentMovePlayer,
        movesRemaining,
        selectedPiece,
        movePiece,
        selectPiece,
        endTurn,
        lastMovedPiece,
        winner,
        redScore,
        blueScore,
        restartGame,
        resetKey,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context)
    throw new Error("useGameContext must be used within a GameProvider");
  return context;
};
