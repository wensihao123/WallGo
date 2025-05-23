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
  addWallAndUpdate: (player: Player, edge: EdgeCoord) => void;
  completedCells: number[][];
  gamePhase: "placement" | "movement";
  playerPieces: Record<Player, Piece[]>;
  addPiece: (player: Player, row: number, col: number) => void;
  setTitle: (title: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [playerWalls, setPlayerWalls] = useState<Record<Player, EdgeCoord[]>>({
    0: [],
    1: [],
  });
  const [completedCells, setCompletedCells] = useState<number[][]>(
    Array.from({ length: 7 }, () => Array(7).fill(-1))
  );

  const [playerPieces, setPlayerPieces] = useState<Record<Player, Piece[]>>({
    0: [],
    1: [],
  });
  const [gamePhase, setGamePhase] = useState<"placement" | "movement">(
    "placement"
  );

    useEffect(() => {
    document.title = gamePhase === 'placement' ? '棋子放置阶段' : '移动阶段';
  }, [gamePhase]);

  const addWallAndUpdate = useCallback(
    (player: Player, edge: EdgeCoord) => {
      if (gamePhase === "placement") return;
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
        return updated;
      });
    },
    [gamePhase]
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

  return (
    <GameContext.Provider
      value={{
        playerWalls,
        addWallAndUpdate,
        completedCells,
        gamePhase,
        playerPieces,
        addPiece,
        setTitle: () => {}
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
