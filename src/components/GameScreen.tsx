import { useEffect, useCallback } from 'react';
import { LogOut, Wifi } from 'lucide-react';
import { useGame } from '../hooks/useGame';
import { callGameAction } from '../services/supabase';
import { getWinningCells } from '../types/game';
import GameBoard from './GameBoard';
import TurnTimer from './TurnTimer';
import type { Game } from '../types/game';

interface GameScreenProps {
  gameId: string;
  playerId: string;
  onGameOver: (game: Game) => void;
  onExit: () => void;
}

export default function GameScreen({ gameId, playerId, onGameOver, onExit }: GameScreenProps) {
  const { game, loading, error, makeMove, abandonGame, clearError } = useGame(gameId, playerId);

  const myMark = game?.player_x_id === playerId ? 'X' : 'O';
  const opponentName = myMark === 'X' ? game?.player_o_name : game?.player_x_name;
  const myName = myMark === 'X' ? game?.player_x_name : game?.player_o_name;
  const isMyTurn = game?.current_turn === myMark && game?.status === 'playing';
  const winningCells = game ? getWinningCells(game.board) : [];

  useEffect(() => {
    if (game?.status === 'finished' || game?.status === 'abandoned') {
      onGameOver(game);
    }
  }, [game, onGameOver]);

  const handleTimeout = useCallback(async () => {
    if (!game || game.mode !== 'timed') return;
    await callGameAction('handle_timeout', { game_id: gameId });
  }, [game, gameId]);

  async function handleExit() {
    await abandonGame();
    onExit();
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 bg-mesh flex flex-col p-4">
      <div className="flex items-center justify-between mb-6 max-w-md mx-auto w-full">
        <div className="flex items-center gap-2 text-gray-500 text-xs">
          <Wifi className="w-3.5 h-3.5 text-green-400" />
          <span className="text-green-400">Live</span>
          {game.mode === 'timed' && <span className="bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full text-xs">Timed</span>}
        </div>
        <button
          onClick={handleExit}
          className="flex items-center gap-1.5 text-gray-600 hover:text-gray-300 text-xs transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Forfeit
        </button>
      </div>

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <PlayerCard
            name={myName || 'You'}
            mark={myMark}
            isActive={isMyTurn}
            isSelf
          />
          <div className="text-gray-700 text-sm font-medium">VS</div>
          <PlayerCard
            name={opponentName || 'Opponent'}
            mark={myMark === 'X' ? 'O' : 'X'}
            isActive={!isMyTurn && game.status === 'playing'}
            isSelf={false}
          />
        </div>

        <div className="mb-4 text-center">
          {game.status === 'playing' && (
            <p className={`text-sm font-medium transition-colors ${isMyTurn ? 'text-cyan-400' : 'text-gray-500'}`}>
              {isMyTurn ? 'Your turn' : `${opponentName}'s turn`}
            </p>
          )}
        </div>

        {game.mode === 'timed' && game.status === 'playing' && (
          <div className="flex justify-center mb-5">
            <TurnTimer
              turnStartedAt={game.turn_started_at}
              isMyTurn={isMyTurn}
              onTimeout={handleTimeout}
            />
          </div>
        )}

        <GameBoard
          board={game.board}
          onCellClick={makeMove}
          disabled={!isMyTurn || loading}
          winningCells={winningCells}
        />

        {error && (
          <div
            onClick={clearError}
            className="mt-4 text-center bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 cursor-pointer"
          >
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface PlayerCardProps {
  name: string;
  mark: 'X' | 'O';
  isActive: boolean;
  isSelf: boolean;
}

function PlayerCard({ name, mark, isActive, isSelf }: PlayerCardProps) {
  return (
    <div className={`flex flex-col items-center gap-2 px-4 py-3 rounded-2xl border transition-all ${
      isActive
        ? mark === 'X'
          ? 'bg-rose-500/10 border-rose-500/30'
          : 'bg-sky-500/10 border-sky-500/30'
        : 'bg-gray-900 border-gray-800'
    }`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold ${
        mark === 'X' ? 'bg-rose-500/20 text-rose-400' : 'bg-sky-500/20 text-sky-400'
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
