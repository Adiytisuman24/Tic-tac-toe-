import type { CellValue } from '../types/game';

interface GameBoardProps {
  board: CellValue[];
  onCellClick: (index: number) => void;
  disabled: boolean;
  winningCells: number[];
}

export default function GameBoard({ board, onCellClick, disabled, winningCells }: GameBoardProps) {
  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-xs mx-auto">
      {board.map((cell, i) => {
        const isWinning = winningCells.includes(i);
        const isEmpty = cell === '';
        const canClick = isEmpty && !disabled;

        return (
          <button
            key={i}
            onClick={() => canClick && onCellClick(i)}
            disabled={!canClick}
            className={`
              aspect-square rounded-2xl border-2 flex items-center justify-center text-4xl font-bold
              transition-all duration-150 select-none
              ${isWinning
                ? cell === 'X'
                  ? 'bg-rose-500/20 border-rose-500 shadow-lg shadow-rose-500/20'
                  : 'bg-sky-500/20 border-sky-500 shadow-lg shadow-sky-500/20'
                : 'bg-gray-900 border-gray-800'
              }
              ${canClick ? 'hover:border-gray-600 hover:bg-gray-800 cursor-pointer active:scale-95' : 'cursor-default'}
            `}
          >
            {cell === 'X' && (
              <span className={`${isWinning ? 'text-rose-400' : 'text-rose-500'} drop-shadow-sm`}>
                X
              </span>
            )}
            {cell === 'O' && (
              <span className={`${isWinning ? 'text-sky-400' : 'text-sky-500'} drop-shadow-sm`}>
                O
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

const WINNING_COMBOS = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

export function getWinningCells(board: CellValue[]): number[] {
  for (const [a,b,c] of WINNING_COMBOS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return [a, b, c];
    }
  }
  return [];
}
