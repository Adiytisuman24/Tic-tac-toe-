import { useEffect, useState } from 'react';
import { Copy, Check, X } from 'lucide-react';
import type { Game } from '../types/game';

interface WaitingRoomScreenProps {
  game: Game | null;
  onCancel: () => void;
}

export default function WaitingRoomScreen({ game, onCancel }: WaitingRoomScreenProps) {
  const [copied, setCopied] = useState(false);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    return () => clearInterval(interval);
  }, []);

  function copyCode() {
    if (!game?.room_code) return;
    navigator.clipboard.writeText(game.room_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Room Created</h2>
        <p className="text-gray-500 text-sm mb-8">Share this code with a friend</p>

        {game?.room_code && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Room Code</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl font-mono font-bold text-cyan-400 tracking-[0.3em]">
                {game.room_code}
              </span>
              <button
                onClick={copyCode}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Waiting for opponent{dots}</p>
        </div>

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
