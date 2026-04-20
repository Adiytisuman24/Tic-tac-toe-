import { Trophy, RotateCcw, Home, Minus } from 'lucide-react';
import type { Game } from '../types/game';

interface ResultScreenProps {
  game: Game;
  playerId: string;
  onPlayAgain: () => void;
  onHome: () => void;
}

export default function ResultScreen({ game, playerId, onPlayAgain, onHome }: ResultScreenProps) {
  const myMark = game.player_x_id === playerId ? 'X' : 'O';
  const isDraw = game.winner === 'draw';
  const iWon = !isDraw && game.winner === myMark;
  const iLost = !isDraw && game.winner !== myMark;

  let headline = '';
  let subline = '';
  let accentClass = '';
  let bgClass = '';

  if (isDraw) {
    headline = "It's a Draw";
    subline = "You're evenly matched";
    accentClass = 'text-gray-300';
    bgClass = 'from-gray-800 to-gray-900';
  } else if (iWon) {
    headline = 'You Win!';
    subline = '+100 points';
    accentClass = 'text-cyan-400';
    bgClass = 'from-cyan-900/30 to-gray-900';
  } else {
    headline = 'You Lose';
    subline = '-50 points';
    accentClass = 'text-rose-400';
    bgClass = 'from-rose-900/20 to-gray-900';
  }

  const xName = game.player_x_name;
  const oName = game.player_o_name || 'Opponent';

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className={`rounded-3xl bg-gradient-to-b ${bgClass} border border-gray-800 p-8 text-center mb-4`}>
          <div className="mb-6">
            {iWon && <Trophy className="w-14 h-14 text-amber-400 mx-auto mb-3 drop-shadow-lg" />}
            {isDraw && <Minus className="w-14 h-14 text-gray-400 mx-auto mb-3" />}
            {iLost && (
              <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-rose-400">✗</span>
              </div>
            )}
            <h2 className={`text-3xl font-bold ${accentClass}`}>{headline}</h2>
            <p className="text-gray-500 text-sm mt-1">{subline}</p>
          </div>

          <div className="bg-gray-900/50 rounded-2xl p-4 mb-2">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold mx-auto mb-1.5 ${
                  game.winner === 'X' ? 'bg-rose-500/30 text-rose-300' : 'bg-rose-500/15 text-rose-500'
                }`}>
                  X
                </div>
                <p className="text-white text-xs font-semibold truncate">{xName}</p>
                {game.player_x_id === playerId && <p className="text-gray-600 text-xs">You</p>}
              </div>

              <div className="px-4">
                <div className="text-xl font-bold text-gray-600">
                  {isDraw ? '—' : game.winner === 'X' ? '1' : '0'}
                  <span className="mx-1 text-gray-700">:</span>
                  {isDraw ? '—' : game.winner === 'O' ? '1' : '0'}
                </div>
              </div>

              <div className="text-center flex-1">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold mx-auto mb-1.5 ${
                  game.winner === 'O' ? 'bg-sky-500/30 text-sky-300' : 'bg-sky-500/15 text-sky-500'
                }`}>
                  O
                </div>
                <p className="text-white text-xs font-semibold truncate">{oName}</p>
                {game.player_o_id === playerId && <p className="text-gray-600 text-xs">You</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={onPlayAgain}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Play Again
          </button>
          <button
            onClick={onHome}
            className="w-full bg-gray-900 hover:bg-gray-800 border border-gray-800 text-white font-semibold py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 text-gray-400" />
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
