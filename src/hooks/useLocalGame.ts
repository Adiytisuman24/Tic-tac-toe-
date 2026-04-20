
import { useState, useCallback, useEffect } from 'react';
import type { Game, CellValue, Winner } from '../types/game';
import { findBestMove, AIDifficulty } from '../services/ai';

export function useLocalGame(playerId: string, playerName: string, difficulty: AIDifficulty = 'hard') {
  const [game, setGame] = useState<Game | null>(null);

  const initGame = useCallback(() => {
    const newGame: Game = {
      id: 'local_ai',
      board: Array(9).fill(''),
      player_x_id: playerId,
      player_o_id: 'ai_bot',
      player_x_name: playerName,
      player_o_name: `AI (${difficulty.toUpperCase()})`,
      current_turn: 'X',
      status: 'playing',
      winner: null,
      winner_name: null,
      mode: 'ai',
      turn_started_at: new Date().toISOString(),
      room_code: null,
      created_at: new Date().toISOString(),
    };
    setGame(newGame);
  }, [playerId, playerName, difficulty]);

  const checkWinner = (board: CellValue[]): Winner => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a] as Winner;
      }
    }
    if (board.every(cell => cell !== '')) return 'draw';
    return null;
  };

  const makeMove = useCallback(async (index: number) => {
    if (!game || game.status !== 'playing' || game.board[index] !== '' || game.current_turn !== 'X') return;

    const newBoard = [...game.board];
    newBoard[index] = 'X';
    
    const winner = checkWinner(newBoard);
    const status = winner ? 'finished' : 'playing';

    setGame(prev => prev ? {
      ...prev,
      board: newBoard,
      current_turn: 'O',
      status,
      winner,
      winner_name: winner === 'X' ? prev.player_x_name : (winner === 'O' ? prev.player_o_name : null)
    } : null);
  }, [game]);

  useEffect(() => {
    if (game?.status === 'playing' && game.current_turn === 'O') {
      const timer = setTimeout(() => {
        const aiMove = findBestMove(game.board.map(c => c === '' ? null : c), difficulty);
        if (aiMove !== -1) {
          const newBoard = [...game.board];
          newBoard[aiMove] = 'O';
          const winner = checkWinner(newBoard);
          const status = winner ? 'finished' : 'playing';
          
          setGame(prev => prev ? {
            ...prev,
            board: newBoard,
            current_turn: 'X',
            status,
            winner,
            winner_name: winner === 'X' ? prev.player_x_name : (winner === 'O' ? prev.player_o_name : null)
          } : null);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [game?.current_turn, game?.status, game?.board, game?.player_x_name, game?.player_o_name, difficulty]);

  return { game, makeMove, initGame, abandonGame: () => setGame(null) };
}
