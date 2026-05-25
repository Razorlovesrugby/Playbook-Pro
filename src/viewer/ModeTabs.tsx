type ViewMode = 'overview' | 'step_by_step';

interface ModeTabsProps {
  mode: ViewMode;
  onChange: (m: ViewMode) => void;
}

export function ModeTabs({ mode, onChange }: ModeTabsProps) {
  return (
    <div className="flex border-b border-white/10 mb-4">
      {(['overview', 'step_by_step'] as ViewMode[]).map(m => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`px-4 py-2 text-sm font-medium transition-colors min-h-11
            ${mode === m
              ? 'text-white border-b-2 border-white'
              : 'text-white/50 hover:text-white/80'
            }`}
        >
          {m === 'overview' ? '▶  Overview' : '☰  Step by Step'}
        </button>
      ))}
    </div>
  );
}
