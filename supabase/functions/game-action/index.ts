import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const WINNING_COMBOS = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

function checkWinner(board: string[]): string | null {
  for (const [a,b,c] of WINNING_COMBOS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

function checkDraw(board: string[]): boolean {
  return board.every(c => c !== '') && !checkWinner(board);
}

function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { action, ...payload } = await req.json();

    const ok = (data: unknown) => new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

    const err = (msg: string, status = 400) => new Response(JSON.stringify({ error: msg }), {
      status, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

    async function ensurePlayer(id: string, name: string) {
      const { data } = await supabase.from('players').select('id').eq('id', id).maybeSingle();
      if (!data) {
        await supabase.from('players').insert({ id, username: name });
      }
    }

    async function updateWin(playerId: string) {
      const { data } = await supabase.from('players').select('wins,win_streak,score').eq('id', playerId).maybeSingle();
      await supabase.from('players').update({
        wins: (data?.wins || 0) + 1,
        win_streak: (data?.win_streak || 0) + 1,
        score: (data?.score || 0) + 100,
      }).eq('id', playerId);
    }

    async function updateLoss(playerId: string) {
      const { data } = await supabase.from('players').select('losses,score').eq('id', playerId).maybeSingle();
      await supabase.from('players').update({
        losses: (data?.losses || 0) + 1,
        win_streak: 0,
        score: Math.max(0, (data?.score || 0) - 50),
      }).eq('id', playerId);
    }

    async function updateDraw(playerId: string) {
      const { data } = await supabase.from('players').select('draws,score').eq('id', playerId).maybeSingle();
      await supabase.from('players').update({
        draws: (data?.draws || 0) + 1,
        score: (data?.score || 0) + 10,
      }).eq('id', playerId);
    }

    switch (action) {

      case 'join_matchmaking': {
        const { player_id, player_name, mode } = payload;
        await ensurePlayer(player_id, player_name);

        const { data: waiting } = await supabase
          .from('matchmaking_queue')
          .select('*')
          .eq('mode', mode)
          .neq('player_id', player_id)
          .order('joined_at', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (waiting) {
          await supabase.from('matchmaking_queue').delete().eq('id', waiting.id);
          const { data: game, error } = await supabase.from('games').insert({
            board: ['','','','','','','','',''],
            player_x_id: waiting.player_id,
            player_o_id: player_id,
            player_x_name: waiting.player_name,
            player_o_name: player_name,
            current_turn: 'X',
            status: 'playing',
            mode,
            turn_started_at: new Date().toISOString(),
          }).select().single();
          if (error) return err(error.message, 500);
          return ok({ game });
        }

        await supabase.from('matchmaking_queue').delete().eq('player_id', player_id);
        await supabase.from('matchmaking_queue').insert({ player_id, player_name, mode });
        return ok({ game: null, queued: true });
      }

      case 'cancel_matchmaking': {
        const { player_id } = payload;
        await supabase.from('matchmaking_queue').delete().eq('player_id', player_id);
        return ok({ success: true });
      }

      case 'create_room': {
        const { player_id, player_name, mode, room_code: provided_code } = payload;
        await ensurePlayer(player_id, player_name);
        const room_code = provided_code || generateRoomCode();
        const { data: game, error } = await supabase.from('games').insert({
          board: ['','','','','','','','',''],
          player_x_id: player_id,
          player_x_name: player_name,
          current_turn: 'X',
          status: 'waiting',
          mode,
          room_code,
          turn_started_at: new Date().toISOString(),
        }).select().single();
        if (error) return err(error.message, 500);
        return ok({ game });
      }

      case 'join_room': {
        const { player_id, player_name, room_code } = payload;
        await ensurePlayer(player_id, player_name);

        const { data: game } = await supabase
          .from('games')
          .select('*')
          .eq('room_code', room_code.trim().toUpperCase())
          .eq('status', 'waiting')
          .maybeSingle();

        if (!game) return err('Room not found or already started', 404);
        if (game.player_x_id === player_id) return err('Cannot join your own room');

        const { data: updated, error } = await supabase
          .from('games')
          .update({
            player_o_id: player_id,
            player_o_name: player_name,
            status: 'playing',
            turn_started_at: new Date().toISOString(),
          })
          .eq('id', game.id)
          .select()
          .single();
        if (error) return err(error.message, 500);
        return ok({ game: updated });
      }

      case 'make_move': {
        const { game_id, player_id, cell_index } = payload;

        const { data: game } = await supabase.from('games').select('*').eq('id', game_id).maybeSingle();
        if (!game) return err('Game not found', 404);
        if (game.status !== 'playing') return err('Game is not in progress');

        const isX = game.player_x_id === player_id;
        const isO = game.player_o_id === player_id;
        if (!isX && !isO) return err('Not a player in this game', 403);

        const mark = isX ? 'X' : 'O';
        if (game.current_turn !== mark) return err('Not your turn');

        if (game.mode === 'timed' && game.turn_started_at) {
          const elapsed = Date.now() - new Date(game.turn_started_at).getTime();
          if (elapsed > 30500) return err('Time expired');
        }

        if (cell_index < 0 || cell_index > 8) return err('Invalid cell index');
        if (game.board[cell_index] !== '') return err('Cell already taken');

        const newBoard = [...game.board];
        newBoard[cell_index] = mark;

        const winner = checkWinner(newBoard);
        const isDraw = !winner && checkDraw(newBoard);

        const updates: Record<string, unknown> = {
          board: newBoard,
          current_turn: mark === 'X' ? 'O' : 'X',
          turn_started_at: new Date().toISOString(),
        };

        if (winner) {
          const winnerName = winner === 'X' ? game.player_x_name : game.player_o_name;
          const winnerId = winner === 'X' ? game.player_x_id : game.player_o_id;
          const loserId = winner === 'X' ? game.player_o_id : game.player_x_id;
          Object.assign(updates, { status: 'finished', winner, winner_name: winnerName });
          await updateWin(winnerId);
          await updateLoss(loserId);
        } else if (isDraw) {
          Object.assign(updates, { status: 'finished', winner: 'draw', winner_name: null });
          await updateDraw(game.player_x_id);
          await updateDraw(game.player_o_id);
        }

        const { data: updated, error } = await supabase.from('games').update(updates).eq('id', game_id).select().single();
        if (error) return err(error.message, 500);
        return ok({ game: updated });
      }

      case 'handle_timeout': {
        const { game_id } = payload;
        const { data: game } = await supabase.from('games').select('*').eq('id', game_id).maybeSingle();
        if (!game || game.status !== 'playing') return err('Invalid game');
        if (!game.turn_started_at) return err('No timer running');

        const elapsed = Date.now() - new Date(game.turn_started_at).getTime();
        if (elapsed < 30000) return err('Time has not expired');

        const loser = game.current_turn;
        const winner = loser === 'X' ? 'O' : 'X';
        const winnerName = winner === 'X' ? game.player_x_name : game.player_o_name;
        const winnerId = winner === 'X' ? game.player_x_id : game.player_o_id;
        const loserId = loser === 'X' ? game.player_x_id : game.player_o_id;

        await supabase.from('games').update({ status: 'finished', winner, winner_name: winnerName }).eq('id', game_id);
        await updateWin(winnerId);
        await updateLoss(loserId);

        return ok({ success: true, winner, winner_name: winnerName });
      }

      case 'abandon_game': {
        const { game_id, player_id } = payload;
        const { data: game } = await supabase.from('games').select('*').eq('id', game_id).maybeSingle();
        if (!game || game.status !== 'playing') return ok({ success: true });

        const isX = game.player_x_id === player_id;
        const winner = isX ? 'O' : 'X';
        const winnerName = winner === 'X' ? game.player_x_name : game.player_o_name;
        const winnerId = winner === 'X' ? game.player_x_id : game.player_o_id;

        await supabase.from('games').update({ status: 'abandoned', winner, winner_name: winnerName }).eq('id', game_id);
        await updateWin(winnerId);
        await updateLoss(player_id);

        return ok({ success: true });
      }

      default:
        return err('Unknown action');
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
