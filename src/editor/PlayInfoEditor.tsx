import type { PlayInfo } from '../types';
import type { Difficulty } from '../shared/types';

const CATEGORIES = [
  'Attack Structure', 'Defence', 'Set Piece', 'Kick Game',
  'Restart', 'Skills', 'Lineout', 'Scrum', 'Maul', 'Ruck',
];

const DIFFICULTIES: { id: Difficulty; label: string }[] = [
  { id: 'beginner',     label: 'Beginner'     },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced',     label: 'Advanced'     },
];

const INFO_FIELDS: { key: keyof PlayInfo; label: string; placeholder: string }[] = [
  { key: 'what_is_it',          label: 'What Is It',          placeholder: 'What is this play trying to achieve?'  },
  { key: 'when_to_use',         label: 'When To Use',         placeholder: 'e.g. Inside the opp 22 on a penalty'   },
  { key: 'why_it_works',        label: 'Why It Works',        placeholder: 'The tactical reasoning behind it'       },
  { key: 'key_positions',       label: 'Key Positions',       placeholder: 'e.g. 10, 12, 13'                       },
  { key: 'options_alternatives',label: 'Options / Variations',placeholder: 'How can this play be adjusted?'        },
  { key: 'common_mistakes',     label: 'Common Mistakes',     placeholder: 'What goes wrong most often?'           },
];

interface PlayInfoEditorProps {
  info: PlayInfo;
  difficulty: Difficulty;
  category: string;
  onInfoChange: (info: PlayInfo) => void;
  onDifficultyChange: (d: Difficulty) => void;
  onCategoryChange: (c: string) => void;
}

export function PlayInfoEditor({
  info, difficulty, category,
  onInfoChange, onDifficultyChange, onCategoryChange,
}: PlayInfoEditorProps) {
  const set = (key: keyof PlayInfo, value: string) =>
    onInfoChange({ ...info, [key]: value || undefined });

  return (
    <div className="flex flex-col gap-4">
      {/* Difficulty */}
      <div>
        <label className="text-white/50 text-xs font-medium uppercase tracking-wide block mb-2">Difficulty</label>
        <div className="flex gap-1.5 flex-wrap">
          {DIFFICULTIES.map(d => (
            <button
              key={d.id}
              onClick={() => onDifficultyChange(d.id)}
              className={`px-3 py-1.5 rounded text-xs font-medium border transition-all min-h-9 ${
                difficulty === d.id
                  ? 'bg-white text-[#0a0f1a] border-white'
                  : 'border-white/20 text-white/50 hover:text-white'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="text-white/50 text-xs font-medium uppercase tracking-wide block mb-2">Category</label>
        <select
          value={category}
          onChange={e => onCategoryChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm outline-none focus:border-white/30 min-h-9"
        >
          {CATEGORIES.map(c => (
            <option key={c} value={c} className="bg-[#111827]">{c}</option>
          ))}
        </select>
      </div>

      {/* Info fields */}
      <div className="flex flex-col gap-3">
        {INFO_FIELDS.map(field => (
          <div key={field.key}>
            <label className="text-white/50 text-xs font-medium uppercase tracking-wide block mb-1">
              {field.label}
            </label>
            <textarea
              value={info[field.key] ?? ''}
              onChange={e => set(field.key, e.target.value)}
              placeholder={field.placeholder}
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm outline-none focus:border-white/30 resize-none placeholder:text-white/20"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
