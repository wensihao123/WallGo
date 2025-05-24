import { useState } from "react";
import "./App.css";
import { Cell } from "./components/Cell";
import { EdgeHorizontal } from "./components/EdgeHorizontal";
import { EdgeVertical } from "./components/EdgeVertical";
import { Corner } from "./components/Corner";
import { GameProvider } from "./context/GameContext";
import { DebugPanel } from "./components/DebugPanel";
import { Indicator } from "./components/Indicator";
import { GameOverModal } from "./components/GameOverBoard";

const BOARD_SIZE = 7;

export default function App() {
  const [currentPlayer, setCurrentPlayer] = useState(0);

  const switchPlayer = () => {
    setCurrentPlayer((prev) => (prev === 0 ? 1 : 0));
  };

  return (
    <GameProvider>
      <div className="game-container">
        <Indicator />
        <div className="board">
          {Array.from({ length: BOARD_SIZE }).flatMap((_, row) =>
            Array.from({ length: BOARD_SIZE }).map((_, col) => (
              <Cell key={`cell-${row}-${col}`} row={row} col={col} />
            ))
          )}

          {Array.from({ length: BOARD_SIZE + 1 }).flatMap((_, row) =>
            Array.from({ length: BOARD_SIZE }).map((_, col) => (
              <EdgeHorizontal
                key={`eh-${row}-${col}`}
                row={row}
                col={col}
                currentPlayer={currentPlayer}
                onClaim={switchPlayer}
              />
            ))
          )}

          {Array.from({ length: BOARD_SIZE }).flatMap((_, row) =>
            Array.from({ length: BOARD_SIZE + 1 }).map((_, col) => (
              <EdgeVertical
                key={`ev-${row}-${col}`}
                row={row}
                col={col}
                currentPlayer={currentPlayer}
                onClaim={switchPlayer}
              />
            ))
          )}

          {Array.from({ length: BOARD_SIZE + 1 }).flatMap((_, row) =>
            Array.from({ length: BOARD_SIZE + 1 }).map((_, col) => (
              <Corner key={`corner-${row}-${col}`} row={row} col={col} />
            ))
          )}
        </div>
        <GameOverModal />
      </div>
    </GameProvider>
  );
}