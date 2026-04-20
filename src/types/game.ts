export type CellValue = 'X' | 'O' | '';
export type GameStatus = 'waiting' | 'playing' | 'finished' | 'abandoned';
export type GameMode = 'classic' | 'timed' | 'ai';
export type Winner = 'X' | 'O' | 'draw' | null;
export type AppScreen = 'home' | 'matchmaking' | 'waiting_room' | 'game' | 'result';

export interface Player {
  id: string;
  username: string;
  wins: number;
  losses: number;
  draws: number;
  win_streak: number;
  score: number;
  created_at: string;
}

export interface Game {
  id: string;
  board: CellValue[];
  player_x_id: string;
  player_o_id: string | null;
  player_x_name: string;
  player_o_name: string | null;
  current_turn: 'X' | 'O';
  status: GameStatus;
  winner: Winner;
  winner_name: string | null;
  mode: GameMode;
  turn_started_at: string | null;
  room_code: string | null;
  created_at: string;
}

export interface AppState {
  screen: AppScreen;
  playerId: string;
  playerName: string;
  gameId: string | null;
  gameMode: GameMode;
}
