import { Badges } from '../viewer/Badges';
import type { TeamPlayEntry } from './types';

interface TeamPlayRowProps {
  entry: TeamPlayEntry;
  index: number;
  total: number;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function TeamPlayRow({ entry, index, total, onRemove, onMoveUp, onMoveDown }: TeamPlayRowProps) {
  const play = entry.plays;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5">
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium leading-tight truncate">{play.title}</p>
        <Badges difficulty={play.difficulty} category={play.category} />
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={onMoveUp}
          disabled={index === 0}
          className="p-1.5 text-white/40 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors min-h-11 min-w-11 flex items-center justify-center"
          aria-label="Move up"
        >
          ↑
        </button>
        <button
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="p-1.5 text-white/40 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors min-h-11 min-w-11 flex items-center justify-center"
          aria-label="Move down"
        >
          ↓
        </button>
        <button
          onClick={onRemove}
          className="p-1.5 text-white/30 hover:text-red-400 transition-colors min-h-11 min-w-11 flex items-center justify-center text-xs"
          aria-label="Remove play"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
