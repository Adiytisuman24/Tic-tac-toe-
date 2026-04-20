import { useState } from 'react';
import { Grid3x3 as Grid3X3, Zap, Users, Hash, Trophy } from 'lucide-react';
import type { GameMode } from '../types/game';
import type { AIDifficulty } from '../services/ai';

interface HomeScreenProps {
  playerName: string;
  onSetName: (name: string) => void;
  onPlayOnline: (mode: GameMode, difficulty?: AIDifficulty) => void;
  onCreateRoom: (mode: GameMode) => void;
  onJoinRoom: (code: string, mode: GameMode) => void;
  onShowLeaderboard: () => void;
}

export default function HomeScreen({
  playerName,
  onSetName,
  onPlayOnline,
  onCreateRoom,
  onJoinRoom,
  onShowLeaderboard,
}: HomeScreenProps) {
  const [nameInput, setNameInput] = useState(playerName);
  const [mode, setMode] = useState<GameMode>('classic');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('hard');
  const [joinCode, setJoinCode] = useState('');
  const [tab, setTab] = useState<'quick' | 'room'>('quick');
  const [nameError, setNameError] = useState('');

  function validateName(): boolean {
    const trimmed = nameInput.trim();
    if (trimmed.length < 2) {
      setNameError('Name must be at least 2 characters');
      return false;
    }
    if (trimmed.length > 20) {
      setNameError('Name must be 20 characters or less');
      return false;
    }
    setNameError('');
    onSetName(trimmed);
    return true;
  }

  function handlePlayOnline() {
    if (!validateName()) return;
    onPlayOnline(mode, difficulty);
  }

  function handleCreateRoom() {
    if (!validateName()) return;
    onCreateRoom(mode);
  }

  function handleJoinRoom() {
    if (!validateName()) return;
    if (joinCode.trim().length !== 6) {
      return;
    }
    onJoinRoom(joinCode.trim(), mode);
  }

  return (
    <div className="min-h-screen bg-gray-950 bg-mesh flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10 animate-float">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 mb-6 neon-glow">
            <Grid3X3 className="w-10 h-10 text-cyan-400" strokeWidth={1} />
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-2">TIC TAC TOE</h1>
          <p className="text-gray-500 text-sm font-medium tracking-wide">SUPEREVOLVED · MULTIPLAYER · AI</p>
        </div>

        <div className="glass-card rounded-[2rem] p-8 space-y-6 shadow-2xl">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={e => { setNameInput(e.target.value); setNameError(''); }}
              onBlur={() => nameInput.trim().length >= 2 && onSetName(nameInput.trim())}
              placeholder="Enter nickname..."
              maxLength={20}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
            />
            {nameError && <p className="text-red-400 text-xs mt-1.5">{nameError}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Game Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setMode('classic')}
                className={`flex flex-col items-center justify-center gap-1.5 px-2 py-3 rounded-xl border text-xs font-medium transition-all ${
                  mode === 'classic'
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                <Users className="w-4 h-4" />
                Classic
              </button>
              <button
                onClick={() => setMode('timed')}
                className={`flex flex-col items-center justify-center gap-1.5 px-2 py-3 rounded-xl border text-xs font-medium transition-all ${
                  mode === 'timed'
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                <Zap className="w-4 h-4" />
                Timed
              </button>
              <button
                onClick={() => setMode('ai')}
                className={`flex flex-col items-center justify-center gap-1.5 px-2 py-3 rounded-xl border text-xs font-medium transition-all ${
                  mode === 'ai'
                    ? 'bg-purple-500/15 border-purple-500/40 text-purple-400'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
                Vs AI
              </button>
            </div>
          </div>

          {mode === 'ai' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                AI Difficulty
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['easy', 'moderate', 'hard'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`px-2 py-2 rounded-lg border text-[10px] uppercase font-bold transition-all ${
                      difficulty === d
                        ? d === 'hard' ? 'bg-red-500/20 border-red-500/50 text-red-400' : 
                          d === 'moderate' ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' :
                          'bg-green-500/20 border-green-500/50 text-green-400'
                        : 'bg-gray-800/50 border-gray-700 text-gray-500 hover:border-gray-600'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-600 italic">
                {difficulty === 'hard' ? 'Human winning probability: 0%' : 
                 difficulty === 'moderate' ? 'Extremely challenging' : 
                 'Casual play'}
              </p>
            </div>
          )}

          <div className="flex border-b border-gray-800">
            <button
              onClick={() => setTab('quick')}
              className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                tab === 'quick' ? 'text-cyan-400 border-b-2 border-cyan-400 -mb-px' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {mode === 'ai' ? 'Vs AI' : 'Quick Match'}
            </button>
            <button
              onClick={() => setTab('room')}
              className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                tab === 'room' ? 'text-cyan-400 border-b-2 border-cyan-400 -mb-px' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Private Room
            </button>
          </div>

          {tab === 'quick' ? (
            <button
              onClick={handlePlayOnline}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {mode === 'ai' ? <Grid3X3 className="w-5 h-5" /> : <Users className="w-5 h-5" />}
              {mode === 'ai' ? 'Start AI Match' : 'Find Opponent'}
            </button>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleCreateRoom}
                className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-semibold py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Hash className="w-4 h-4 text-cyan-400" />
                Create Room
              </button>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                  placeholder="ROOM CODE"
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all text-center font-mono tracking-widest text-sm uppercase"
                />
                <button
                  onClick={handleJoinRoom}
                  disabled={joinCode.length !== 6}
                  className="px-5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed text-gray-950 font-bold rounded-xl transition-all active:scale-95"
                >
                  Join
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onShowLeaderboard}
          className="w-full mt-4 flex items-center justify-center gap-2 text-gray-500 hover:text-gray-300 text-sm py-3 transition-colors"
        >
          <Trophy className="w-4 h-4" />
          Leaderboard
        </button>
      </div>
    </div>
  );
}
