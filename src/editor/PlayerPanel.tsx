import type { PlayerData } from '../types';

interface PlayerPanelProps {
  player: PlayerData | null;
  onSetBall: (hasBall: boolean) => void;
  onClearLines: () => void;
  onRemove: () => void;
  onClose: () => void;
}

export function PlayerPanel({ player, onSetBall, onClearLines, onRemove, onClose }: PlayerPanelProps) {
  if (!player) return null;

  const label = player.team === 'attack'
    ? `#${player.number}`
    : player.team === 'defence'
      ? `D${player.number}`
      : `#${player.number}`;

  return (
    <div className="flex items-center gap-2 p-2 bg-white/5 rounded border border-white/10 flex-wrap">
      <span className="text-white/70 text-xs font-medium">{label}</span>

      <button
        onClick={() => onSetBall(!player.has_ball)}
        className={`px-2.5 py-1 text-xs rounded border transition-all min-h-9 ${
          player.has_ball
            ? 'bg-[#F5C518] text-[#0a0f1a] border-[#F5C518] font-semibold'
            : 'border-white/20 text-white/50 hover:text-white'
        }`}
      >
        {player.has_ball ? 'Ball carrier ✓' : 'Give ball'}
      </button>

      <button
        onClick={onClearLines}
        className="px-2.5 py-1 text-xs border border-white/20 text-white/50 hover:text-white rounded transition-colors min-h-9"
      >
        Clear lines
      </button>

      <button
        onClick={onRemove}
        className="px-2.5 py-1 text-xs border border-red-500/40 text-red-400 hover:bg-red-500/10 rounded transition-colors min-h-9"
      >
        Remove
      </button>

      <button
        onClick={onClose}
        className="ml-auto text-white/30 hover:text-white text-xs px-1 min-h-9 flex items-center"
      >
        ✕
      </button>
    </div>
  );
}
