import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface MatchmakingScreenProps {
  onCancel: () => void;
  error: string | null;
}

export default function MatchmakingScreen({ onCancel, error }: MatchmakingScreenProps) {
  const [dots, setDots] = useState('');
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 500);
    const timer = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => { clearInterval(dotsInterval); clearInterval(timer); };
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="relative inline-flex items-center justify-center mb-8">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
          <div className="absolute inset-0 scale-75 rounded-full border-2 border-cyan-500/30 animate-ping" style={{ animationDelay: '0.3s' }} />
          <div className="relative w-20 h-20 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">
          Finding opponent{dots}
        </h2>
        <p className="text-gray-500 text-sm mb-1">
          Searching for a worthy challenger
        </p>
        <p className="text-gray-600 text-xs mb-8">
          {elapsed}s elapsed
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={onCancel}
          className="flex items-center justify-center gap-2 mx-auto text-gray-500 hover:text-gray-300 text-sm border border-gray-800 hover:border-gray-700 px-5 py-2.5 rounded-xl transition-all"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </div>
  );
}
