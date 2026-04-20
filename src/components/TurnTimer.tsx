import { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';

interface TurnTimerProps {
  turnStartedAt: string | null;
  isMyTurn: boolean;
  onTimeout: () => void;
}

export default function TurnTimer({ turnStartedAt, isMyTurn, onTimeout }: TurnTimerProps) {
  const [remaining, setRemaining] = useState(30);

  useEffect(() => {
    if (!turnStartedAt) return;

    function update() {
      const elapsed = (Date.now() - new Date(turnStartedAt!).getTime()) / 1000;
      const rem = Math.max(0, 30 - elapsed);
      setRemaining(rem);
      if (rem <= 0 && isMyTurn) {
        onTimeout();
      }
    }

    update();
    const interval = setInterval(update, 200);
    return () => clearInterval(interval);
  }, [turnStartedAt, isMyTurn, onTimeout]);

  const pct = (remaining / 30) * 100;
  const isUrgent = remaining <= 10;

  return (
    <div className={`flex items-center gap-2 ${isUrgent ? 'text-red-400' : 'text-gray-400'}`}>
      <Timer className="w-4 h-4" />
      <div className="flex items-center gap-2">
        <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-200 ${
              isUrgent ? 'bg-red-500' : 'bg-cyan-500'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className={`text-sm font-mono font-bold min-w-[2rem] ${isUrgent ? 'text-red-400 animate-pulse' : 'text-gray-400'}`}>
          {Math.ceil(remaining)}s
        </span>
      </div>
    </div>
  );
}
