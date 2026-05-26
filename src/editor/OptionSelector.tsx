import type { OptionNumber } from '../types';

const OPTIONS: { num: OptionNumber; colour: string; label: string }[] = [
  { num: 1, colour: '#F5C518', label: 'Option 1' },
  { num: 2, colour: '#4A90D9', label: 'Option 2' },
  { num: 3, colour: '#FF8C00', label: 'Option 3' },
];

interface OptionSelectorProps {
  active: OptionNumber;
  onChange: (n: OptionNumber) => void;
}

export function OptionSelector({ active, onChange }: OptionSelectorProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {OPTIONS.map(opt => (
        <button
          key={opt.num}
          onClick={() => onChange(opt.num)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-all min-h-9"
          style={{
            borderColor: active === opt.num ? opt.colour : 'rgba(255,255,255,0.1)',
            color: active === opt.num ? opt.colour : 'rgba(255,255,255,0.4)',
            backgroundColor: active === opt.num ? `${opt.colour}1A` : 'transparent',
          }}
        >
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: opt.colour }} />
          {opt.label}
        </button>
      ))}
    </div>
  );
}
