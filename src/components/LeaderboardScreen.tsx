import { ArrowLeft, Trophy, Flame, Zap } from 'lucide-react';
import { useLeaderboard } from '../hooks/useGame';

interface LeaderboardScreenProps {
  playerId: string;
  onBack: () => void;
}

export default function LeaderboardScreen({ playerId, onBack }: LeaderboardScreenProps) {
  const { players, loading } = useLeaderboard();

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col p-4">
      <div className="max-w-md mx-auto w-full">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Leaderboard</h1>
            <p className="text-gray-500 text-xs">Global rankings</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No players yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {players.map((p, i) => {
              const isMe = p.id === playerId;
              const rank = i + 1;
              const total = p.wins + p.losses + p.draws;
              const winRate = total > 0 ? Math.round((p.wins / total) * 100) : 0;

              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                    isMe
                      ? 'bg-cyan-500/10 border-cyan-500/30'
                      : 'bg-gray-900 border-gray-800'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    rank === 1 ? 'bg-amber-500/20 text-amber-400' :
                    rank === 2 ? 'bg-gray-400/20 text-gray-300' :
                    rank === 3 ? 'bg-orange-600/20 text-orange-400' :
                    'bg-gray-800 text-gray-500'
                  }`}>
                    {rank <= 3 ? ['🥇','🥈','🥉'][rank - 1] : rank}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-semibold truncate text-sm ${isMe ? 'text-cyan-300' : 'text-white'}`}>
                        {p.username}
                        {isMe && <span className="ml-1 text-xs text-cyan-500">(you)</span>}
                      </p>
                      {p.win_streak >= 3 && (
                        <div className="flex items-center gap-0.5 text-orange-400 text-xs">
                          <Flame className="w-3 h-3" />
                          <span>{p.win_streak}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-gray-500 text-xs">{p.wins}W {p.losses}L {p.draws}D</span>
                      <span className="text-gray-600 text-xs">{winRate}% win rate</span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1 justify-end">
                      <Zap className="w-3 h-3 text-cyan-500" />
                      <span className="text-cyan-400 font-bold text-sm">{p.score}</span>
                    </div>
                    <p className="text-gray-600 text-xs">pts</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
