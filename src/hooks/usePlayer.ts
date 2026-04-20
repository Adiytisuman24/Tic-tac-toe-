import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const PLAYER_ID_KEY = 'ttt_player_id';
const PLAYER_NAME_KEY = 'ttt_player_name';

function getOrCreatePlayerId(): string {
  let id = localStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(PLAYER_ID_KEY, id);
  }
  return id;
}

export function usePlayer() {
  const [playerId] = useState<string>(getOrCreatePlayerId);
  const [playerName, setPlayerNameState] = useState<string>(
    () => localStorage.getItem(PLAYER_NAME_KEY) || ''
  );

  const setPlayerName = useCallback((name: string) => {
    localStorage.setItem(PLAYER_NAME_KEY, name);
    setPlayerNameState(name);
  }, []);

  return { playerId, playerName, setPlayerName };
}
