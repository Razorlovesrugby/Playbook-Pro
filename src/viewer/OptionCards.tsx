import type { StepData, OptionNumber } from '../types';

const OPTION_CONFIG: { num: OptionNumber; colour: string; label: string }[] = [
  { num: 1, colour: '#F5C518', label: 'Option 1' },
  { num: 2, colour: '#4A90D9', label: 'Option 2' },
  { num: 3, colour: '#FF8C00', label: 'Option 3' },
];

interface OptionCardsProps {
  step: StepData;
  activeOptions: OptionNumber[];
  onToggle: (opt: OptionNumber) => void;
}

export function OptionCards({ step, activeOptions, onToggle }: OptionCardsProps) {
  // Only show options that have at least one line in this step
  const present = OPTION_CONFIG.filter(opt =>
    step.lines.some(l => l.option === opt.num),
  );

  // Nothing to filter if only 1 option exists
  if (present.length <= 1) return null;

  const handleToggle = (opt: OptionNumber) => {
    // Prevent all-off: ignore if this is the only active option
    if (activeOptions.includes(opt) && activeOptions.length === 1) return;
    onToggle(opt);
  };

  return (
    <div className="flex gap-2 mt-3 flex-wrap">
      {present.map(opt => {
        const active = activeOptions.includes(opt.num);
        return (
          <button
            key={opt.num}
            onClick={() => handleToggle(opt.num)}
            className="flex items-center gap-2 px-3 py-2 rounded border text-sm transition-all min-h-11"
            style={{
              borderColor: active ? opt.colour : 'rgba(255,255,255,0.1)',
              backgroundColor: active ? `${opt.colour}22` : 'transparent',
              color: active ? opt.colour : 'rgba(255,255,255,0.3)',
            }}
          >
            <span
              className="w-3 h-3 rounded-full inline-block flex-shrink-0"
              style={{ backgroundColor: opt.colour }}
            />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
