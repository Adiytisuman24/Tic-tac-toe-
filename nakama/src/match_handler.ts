
// Nakama Server Authoritative Match Handler (TypeScript)

const OpCode = {
  MOVE: 1,
  UPDATE: 2,
  GAME_OVER: 3,
};

interface State {
  board: (string | null)[];
  players: Record<string, 'X' | 'O'>;
  marks: Record<'X' | 'O', string>;
  currentTurn: 'X' | 'O';
  turnStartedAt: number;
  winner: string | null;
  mode: 'classic' | 'timed';
}

const matchInit = (_ctx: nkruntime.Context, _logger: nkruntime.Logger, _nk: nkruntime.Nakama, params: {[key: string]: string}): {state: State, tickRate: number, label: string} => {
  const mode = params['mode'] || 'classic';
  return {
    state: {
      board: Array(9).fill(null),
      players: {},
      marks: { 'X': '', 'O': '' },
      currentTurn: 'X',
      turnStartedAt: Date.now(),
      winner: null,
      mode: mode as any,
    },
    tickRate: 1, // 1 tick per second is enough for Tic Tac Toe
    label: JSON.stringify({ mode }),
  };
};

const matchJoinAttempt = (_ctx: nkruntime.Context, _logger: nkruntime.Logger, _nk: nkruntime.Nakama, _dispatcher: nkruntime.MatchDispatcher, _tick: number, state: State, _presence: nkruntime.Presence, _metadata: {[key: string]: string}): {state: State, accept: boolean, rejectMessage?: string} => {
  if (Object.keys(state.players).length >= 2) {
    return { state, accept: false, rejectMessage: 'Match full' };
  }
  return { state, accept: true };
};

const matchJoin = (_ctx: nkruntime.Context, _logger: nkruntime.Logger, _nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, _tick: number, state: State, presences: nkruntime.Presence[]): {state: State} => {
  presences.forEach(p => {
    if (!state.marks['X']) {
      state.marks['X'] = p.userId;
      state.players[p.userId] = 'X';
    } else {
      state.marks['O'] = p.userId;
      state.players[p.userId] = 'O';
    }
  });

  if (Object.keys(state.players).length === 2) {
    state.turnStartedAt = Date.now();
    dispatcher.broadcastMessage(OpCode.UPDATE, JSON.stringify(state));
  }

  return { state };
};

const matchLoop = (_ctx: nkruntime.Context, _logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, _tick: number, state: State, messages: nkruntime.MatchData[]): State | null => {
  // Handle Timer-Based Forfeit
  if (state.mode === 'timed' && Object.keys(state.players).length === 2) {
    const elapsed = Date.now() - state.turnStartedAt;
    if (elapsed > 30000) {
      state.winner = state.currentTurn === 'X' ? 'O' : 'X';
      dispatcher.broadcastMessage(OpCode.GAME_OVER, JSON.stringify({ winner: state.winner, reason: 'timeout' }));
      return null; // End match
    }
  }

  messages.forEach(m => {
    if (m.opCode === OpCode.MOVE) {
      const { index } = JSON.parse(nk.binaryToString(m.data));
      const playerMark = state.players[m.presence.userId];

      // Server-Authoritative Validations
      if (state.currentTurn !== playerMark) return;
      if (state.board[index] !== null) return;
      if (index < 0 || index > 8) return;

      // Apply Move
      state.board[index] = playerMark;
      state.currentTurn = playerMark === 'X' ? 'O' : 'X';
      state.turnStartedAt = Date.now();

      // Check Winner
      const winner = checkWinner(state.board);
      if (winner) {
        state.winner = winner;
        dispatcher.broadcastMessage(OpCode.GAME_OVER, JSON.stringify({ winner }));
        return null;
      }

      // Broadcast update
      dispatcher.broadcastMessage(OpCode.UPDATE, JSON.stringify(state));
    }
  });

  return state;
};

function checkWinner(board: (string | null)[]): string | null {
  const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (const [a,b,c] of wins) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  if (board.every(c => c !== null)) return 'draw';
  return null;
}


const matchLeave = (_ctx: nkruntime.Context, _logger: nkruntime.Logger, _nk: nkruntime.Nakama, _dispatcher: nkruntime.MatchDispatcher, _tick: number, state: State, _presences: nkruntime.Presence[]): {state: State} => {
  return { state };
};

const matchTerminate = (_ctx: nkruntime.Context, _logger: nkruntime.Logger, _nk: nkruntime.Nakama, _dispatcher: nkruntime.MatchDispatcher, _tick: number, state: State, _graceSeconds: number): {state: State} => {
  return { state };
};
