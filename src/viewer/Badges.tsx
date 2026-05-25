import type { Difficulty } from '../shared/types';

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  beginner:     'bg-green-900/40 text-green-400 border-green-700',
  intermediate: 'bg-yellow-900/40 text-yellow-400 border-yellow-700',
  advanced:     'bg-red-900/40 text-red-400 border-red-700',
};

interface BadgesProps {
  difficulty: string;
  category: string;
}

export function Badges({ difficulty, category }: BadgesProps) {
  const difficultyStyle = DIFFICULTY_STYLES[difficulty as Difficulty] ?? 'border-white/20 text-white/50';

  return (
    <div className="flex gap-2 flex-wrap mt-1">
      {difficulty && (
        <span className={`px-2 py-0.5 rounded text-xs uppercase font-medium border ${difficultyStyle}`}>
          {difficulty}
        </span>
      )}
      {category && (
        <span className="px-2 py-0.5 rounded text-xs uppercase font-medium border border-white/10 text-white/50">
          {category}
        </span>
      )}
    </div>
  );
}
