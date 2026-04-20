import { useState, useEffect, useCallback } from 'react';
import { usePlayer } from './hooks/usePlayer';
import { useMatchmaking, useRoomWaiting } from './hooks/useGame';
import { callGameAction } from './services/supabase';
import HomeScreen from './components/HomeScreen';
import MatchmakingScreen from './components/MatchmakingScreen';
import WaitingRoomScreen from './components/WaitingRoomScreen';
import GameScreen from './components/GameScreen';
import ResultScreen from './components/ResultScreen';
import LeaderboardScreen from './components/LeaderboardScreen';
import AIGameScreen from './components/AIGameScreen';
import type { Game, GameMode } from './types/game';
import type { AIDifficulty } from './services/ai';

type AppScreen = 'home' | 'matchmaking' | 'waiting_room' | 'game' | 'result' | 'leaderboard';

export default function App() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const { playerId, playerName, setPlayerName } = usePlayer();
  const [screen, setScreen] = useState<AppScreen>('home');
  const [gameId, setGameId] = useState<string | null>(null);
  const [finishedGame, setFinishedGame] = useState<Game | null>(null);
  const [roomGameId, setRoomGameId] = useState<string | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [aiDifficulty, setAIDifficulty] = useState<AIDifficulty>('hard');

  const {
    status: mmStatus,
    foundGame,
    error: mmError,
    startMatchmaking,
    cancelMatchmaking,
  } = useMatchmaking(playerId, playerName);

  const { game: roomGame } = useRoomWaiting(roomGameId);

  useEffect(() => {
    if (mmStatus === 'found' && foundGame) {
      setGameId(foundGame.id);
      setScreen('game');
    }
  }, [mmStatus, foundGame]);

  useEffect(() => {
    if (roomGame?.status === 'playing') {
      setGameId(roomGame.id);
      setScreen('game');
      setRoomGameId(null);
    }
  }, [roomGame?.status, roomGame?.id]);

  const handlePlayOnline = useCallback((mode: GameMode, difficulty?: AIDifficulty) => {
    setGameMode(mode);
    if (difficulty) setAIDifficulty(difficulty);
    if (mode === 'ai') {
      setGameId('local_ai');
      setScreen('game');
    } else {
      setScreen('matchmaking');
      startMatchmaking(mode);
    }
  }, [startMatchmaking]);

  const handleCreateRoom = useCallback(async (mode: GameMode) => {
    setGameMode(mode);
    const { data, error } = await callGameAction<{ game: Game }>('create_room', {
      player_id: playerId,
      player_name: playerName,
      mode,
    });
    if (error || !data?.game) return;
    setRoomGameId(data.game.id);
    setScreen('waiting_room');
  }, [playerId, playerName]);

  const handleJoinRoom = useCallback(async (code: string, mode: GameMode) => {
    // Try to join existing room first
    const { data: joinData, error: joinError } = await callGameAction<{ game: Game }>('join_room', {
      player_id: playerId,
      player_name: playerName,
      room_code: code,
      mode,
    });

    if (!joinError && joinData?.game) {
      setGameId(joinData.game.id);
      setScreen('game');
      return;
    }

    // If room not found, create it with this code and wait
    if (joinError?.toLowerCase().includes('not found')) {
      const { data: createData, error: createError } = await callGameAction<{ game: Game }>('create_room', {
        player_id: playerId,
        player_name: playerName,
        mode,
        room_code: code,
      });

      if (!createError && createData?.game) {
        setRoomGameId(createData.game.id);
        setScreen('waiting_room');
      }
    }
  }, [playerId, playerName]);

  const handleCancelMatchmaking = useCallback(async () => {
    await cancelMatchmaking();
    setScreen('home');
  }, [cancelMatchmaking]);

  const handleCancelRoom = useCallback(() => {
    setRoomGameId(null);
    setScreen('home');
  }, []);

  const handleGameOver = useCallback((game: Game) => {
    setFinishedGame(game);
    setScreen('result');
  }, []);

  const handlePlayAgain = useCallback(() => {
    setFinishedGame(null);
    if (gameMode === 'ai') {
      setGameId('local_ai');
      setScreen('game');
    } else {
      setGameId(null);
      setScreen('matchmaking');
      startMatchmaking(gameMode);
    }
  }, [startMatchmaking, gameMode]);

  const handleHome = useCallback(() => {
    setGameId(null);
    setFinishedGame(null);
    setScreen('home');
  }, []);

  if (!supabaseUrl || !supabaseKey) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6 text-center">
        <div className="max-w-sm glass-card p-8 rounded-3xl border border-red-500/20">
          <h1 className="text-red-400 font-bold mb-4">Configuration Required</h1>
          <p className="text-gray-400 text-sm mb-6">
            Supabase environment variables are not set in your Vercel settings.
          </p>
          <div className="bg-gray-900/50 p-4 rounded-xl text-left text-[10px] font-mono text-gray-500 overflow-x-auto">
            1. Go to Vercel Dashboard<br/>
            2. Settings - Environment Variables<br/>
            3. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'home') {
    return (
      <HomeScreen
        playerName={playerName}
        onSetName={setPlayerName}
        onPlayOnline={handlePlayOnline}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        onShowLeaderboard={() => setScreen('leaderboard')}
      />
    );
  }

  if (screen === 'matchmaking') {
    return (
      <MatchmakingScreen
        onCancel={handleCancelMatchmaking}
        error={mmError}
      />
    );
  }

  if (screen === 'waiting_room') {
    return (
      <WaitingRoomScreen
        game={roomGame}
        onCancel={handleCancelRoom}
      />
    );
  }

  if (screen === 'game' && gameId) {
    if (gameMode === 'ai') {
      return (
        <AIGameScreen
          playerId={playerId}
          playerName={playerName}
          difficulty={aiDifficulty}
          onGameOver={handleGameOver}
          onExit={handleHome}
        />
      );
    }
    return (
      <GameScreen
        gameId={gameId}
        playerId={playerId}
        onGameOver={handleGameOver}
        onExit={handleHome}
      />
    );
  }

  if (screen === 'result' && finishedGame) {
    return (
      <ResultScreen
        game={finishedGame}
        playerId={playerId}
        onPlayAgain={handlePlayAgain}
        onHome={handleHome}
      />
    );
  }

  if (screen === 'leaderboard') {
    return (
      <LeaderboardScreen
        playerId={playerId}
        onBack={() => setScreen('home')}
      />
    );
  }

  return null;
}
