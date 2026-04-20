import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, callGameAction } from '../services/supabase';
import type { Game, GameMode } from '../types/game';

interface UseGameReturn {
  game: Game | null;
  loading: boolean;
  error: string | null;
  makeMove: (cellIndex: number) => Promise<void>;
  abandonGame: () => Promise<void>;
  clearError: () => void;
}

interface LeaderboardPlayer {
  id: string;
  username: string;
  wins: number;
  losses: number;
  draws: number;
  win_streak: number;
  score: number;
}

interface DbResult<T> {
  data: T | null;
  error: unknown;
}

export function useGame(
  gameId: string | null,
  playerId: string
): UseGameReturn {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!gameId || !supabase) {
      setGame(null);
      return;
    }

    supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .maybeSingle()
      .then(({ data }: DbResult<Game>) => {
        if (data) setGame(data);
      });

    const channel = supabase
      .channel(`game:${gameId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${gameId}` },
        (payload: { new: Game }) => {
          setGame(payload.new);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [gameId]);

  const makeMove = useCallback(async (cellIndex: number) => {
    if (!gameId) return;
    setLoading(true);
    setError(null);
    const { error: e } = await callGameAction('make_move', {
      game_id: gameId,
      player_id: playerId,
      cell_index: cellIndex,
    });
    if (e) setError(e);
    setLoading(false);
  }, [gameId, playerId]);

  const abandonGame = useCallback(async () => {
    if (!gameId) return;
    await callGameAction('abandon_game', { game_id: gameId, player_id: playerId });
  }, [gameId, playerId]);

  const clearError = useCallback(() => setError(null), []);

  return { game, loading, error, makeMove, abandonGame, clearError };
}

export function useMatchmaking(
  playerId: string,
  playerName: string
) {
  const [status, setStatus] = useState<'idle' | 'queued' | 'found'>('idle');
  const [foundGame, setFoundGame] = useState<Game | null>(null);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const startMatchmaking = useCallback(async (mode: GameMode) => {
    setStatus('queued');
    setError(null);

    const { data, error: e } = await callGameAction<{ game: Game | null; queued?: boolean }>(
      'join_matchmaking',
      { player_id: playerId, player_name: playerName, mode }
    );

    if (e) {
      setError(e);
      setStatus('idle');
      return;
    }

    if (data?.game) {
      setFoundGame(data.game);
      setStatus('found');
      return;
    }

    if (!supabase) return;

    const channel = supabase
      .channel(`matchmaking:${playerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'games',
          filter: `player_x_id=eq.${playerId}`,
        },
        (payload: { new: Game }) => {
          const g = payload.new;
          if (g.status === 'playing') {
            setFoundGame(g);
            setStatus('found');
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `player_o_id=eq.${playerId}`,
        },
        (payload: { new: Game }) => {
          const g = payload.new;
          if (g.status === 'playing') {
            setFoundGame(g);
            setStatus('found');
          }
        }
      )
      .subscribe();

    channelRef.current = channel;
  }, [playerId, playerName]);

  const cancelMatchmaking = useCallback(async () => {
    await callGameAction('cancel_matchmaking', { player_id: playerId });
    channelRef.current?.unsubscribe();
    channelRef.current = null;
    setStatus('idle');
    setFoundGame(null);
  }, [playerId]);

  useEffect(() => {
    return () => {
      channelRef.current?.unsubscribe();
    };
  }, []);

  return { status, foundGame, error, startMatchmaking, cancelMatchmaking };
}

export function useRoomWaiting(gameId: string | null) {
  const [game, setGame] = useState<Game | null>(null);

  const fetchGame = useCallback(() => {
    if (!gameId || !supabase) return;
    supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .maybeSingle()
      .then(({ data }: DbResult<Game>) => {
        if (data) setGame(data);
      });
  }, [gameId]);

  useEffect(() => {
    if (!gameId || !supabase) return;

    fetchGame();

    const channel = supabase
      .channel(`room:${gameId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${gameId}` },
        (payload: { new: Game }) => setGame(payload.new)
      )
      .subscribe();

    // Polling fallback every 2 seconds to ensure sync
    const interval = setInterval(fetchGame, 2000);

    return () => { 
      channel.unsubscribe(); 
      clearInterval(interval);
    };
  }, [gameId, fetchGame]);

  return { game };
}

export function useLeaderboard() {
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from('players')
      .select('id,username,wins,losses,draws,win_streak,score')
      .order('score', { ascending: false })
      .limit(20)
      .then(({ data }: DbResult<LeaderboardPlayer[]>) => {
        if (data) setPlayers(data);
        setLoading(false);
      });
  }, []);

  return { players, loading };
}
