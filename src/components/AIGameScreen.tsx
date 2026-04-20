
import { useEffect } from 'react';
import { LogOut, Bot } from 'lucide-react';
import { useLocalGame } from '../hooks/useLocalGame';
import { getWinningCells } from '../types/game';
import GameBoard from './GameBoard';
import type { Game } from '../types/game';
import type { AIDifficulty } from '../services/ai';

interface AIGameScreenProps {
  playerId: string;
  playerName: string;
  difficulty: AIDifficulty;
  onGameOver: (game: Game) => void;
  onExit: () => void;
}

export default function AIGameScreen({ playerId, playerName, difficulty, onGameOver, onExit }: AIGameScreenProps) {
  const { game, makeMove, initGame, abandonGame } = useLocalGame(playerId, playerName, difficulty);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    if (game?.status === 'finished') {
      onGameOver(game);
    }
  }, [game?.status, onGameOver, game]);

  const handleExit = () => {
    abandonGame();
    onExit();
  };

  if (!game) return null;

  const opponentName = 'AI Bot';
  const isMyTurn = game.current_turn === 'X' && game.status === 'playing';
  const winningCells = getWinningCells(game.board);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col p-4">
      <div className="flex items-center justify-between mb-6 max-w-md mx-auto w-full">
        <div className="flex items-center gap-2 text-gray-500 text-xs">
          <Bot className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-purple-400">Local AI Match ({difficulty.toUpperCase()})</span>
        </div>
        <button
          onClick={handleExit}
          className="flex items-center gap-1.5 text-gray-600 hover:text-gray-300 text-xs transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Exit
        </button>
      </div>

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <PlayerCard
            name={playerName || 'You'}
            mark="X"
            isActive={isMyTurn}
            isSelf
          />
          <div className="text-gray-700 text-sm font-medium">VS</div>
          <PlayerCard
            name={opponentName}
            mark="O"
            isActive={!isMyTurn && game.status === 'playing'}
            isSelf={false}
          />
        </div>

        <div className="mb-4 text-center">
          {game.status === 'playing' && (
            <p className={`text-sm font-medium transition-colors ${isMyTurn ? 'text-cyan-400' : 'text-gray-500'}`}>
              {isMyTurn ? 'Your turn' : `${opponentName} is thinking...`}
            </p>
          )}
        </div>

        <GameBoard
          board={game.board}
          onCellClick={makeMove}
          disabled={!isMyTurn}
          winningCells={winningCells}
        />
      </div>
    </div>
  );
}

function PlayerCard({ name, mark, isActive, isSelf }: { name: string, mark: 'X' | 'O', isActive: boolean, isSelf: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-2 px-4 py-3 rounded-2xl border transition-all ${
      isActive
        ? mark === 'X'
          ? 'bg-rose-500/10 border-rose-500/30'
          : 'bg-purple-500/10 border-purple-500/30'
        : 'bg-gray-900 border-gray-800'
    }`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold ${
        mark === 'X' ? 'bg-rose-500/20 text-rose-400' : 'bg-purple-500/20 text-purple-400'
      }`}>
        {mark}
      </div>
      <div className="text-center">
        <p className="text-white text-xs font-semibold truncate max-w-[80px]">{name}</p>
        {isSelf && <p className="text-gray-600 text-xs">You</p>}
      </div>
    </div>
  );
}
