/*
  # Multiplayer Tic-Tac-Toe Schema

  ## Tables Created

  ### players
  - `id` (uuid) - client-generated player identifier stored in localStorage
  - `username` (text) - display name
  - `wins` / `losses` / `draws` - match outcomes
  - `win_streak` - current consecutive wins
  - `score` - cumulative score (100 per win, 10 per draw, -50 per loss)

  ### games
  - `id` (uuid) - game identifier
  - `board` (text[9]) - cell values: '', 'X', or 'O'
  - `player_x_id` / `player_o_id` - player UUIDs
  - `player_x_name` / `player_o_name` - display names
  - `current_turn` ('X' or 'O') - whose move it is
  - `status` (waiting|playing|finished|abandoned) - game lifecycle
  - `winner` ('X', 'O', 'draw', or null) - outcome
  - `winner_name` - winner's display name
  - `mode` (classic|timed) - game mode
  - `turn_started_at` - timestamp for timer enforcement
  - `room_code` (unique, optional) - 6-char code for private rooms

  ### matchmaking_queue
  - `player_id` / `player_name` - who is waiting
  - `mode` - game mode preference
  - `joined_at` - for FIFO ordering

  ## Security
  - RLS enabled on all tables
  - Anon users can read game state (public multiplayer game)
  - Direct writes are blocked; all mutations go through edge functions using service role key
  - Write policies granted to service role only (via edge functions)
*/

CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY,
  username text NOT NULL,
  wins integer DEFAULT 0,
  losses integer DEFAULT 0,
  draws integer DEFAULT 0,
  win_streak integer DEFAULT 0,
  score integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board text[] DEFAULT ARRAY['','','','','','','','',''],
  player_x_id uuid NOT NULL REFERENCES players(id),
  player_o_id uuid REFERENCES players(id),
  player_x_name text NOT NULL,
  player_o_name text,
  current_turn text DEFAULT 'X',
  status text DEFAULT 'waiting',
  winner text,
  winner_name text,
  mode text DEFAULT 'classic',
  turn_started_at timestamptz DEFAULT now(),
  room_code text UNIQUE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS matchmaking_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL UNIQUE,
  player_name text NOT NULL,
  mode text DEFAULT 'classic',
  joined_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_games_player_x ON games(player_x_id);
CREATE INDEX IF NOT EXISTS idx_games_player_o ON games(player_o_id);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_room_code ON games(room_code);
CREATE INDEX IF NOT EXISTS idx_queue_mode ON matchmaking_queue(mode);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE matchmaking_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active players"
  ON players FOR SELECT
  TO anon, authenticated
  USING (username IS NOT NULL);

CREATE POLICY "Public can read recent games"
  ON games FOR SELECT
  TO anon, authenticated
  USING (status IN ('waiting', 'playing', 'finished', 'abandoned'));

CREATE POLICY "Public can read queue"
  ON matchmaking_queue FOR SELECT
  TO anon, authenticated
  USING (joined_at > now() - interval '1 hour');
