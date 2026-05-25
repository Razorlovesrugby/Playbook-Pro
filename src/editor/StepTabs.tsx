import type { EditorStep } from './useEditorState';

interface StepTabsProps {
  steps: EditorStep[];
  activeIndex: number;
  onSelect: (i: number) => void;
  onAdd: () => void;
  onInsert: (beforeIndex: number) => void;
  onDelete: (i: number) => void;
}

export function StepTabs({ steps, activeIndex, onSelect, onAdd, onInsert, onDelete }: StepTabsProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto py-1 min-h-[44px]">
      {steps.map((step, i) => (
        <div key={step.step_id} className="flex items-center flex-shrink-0">
          {/* Insert before button (only between steps) */}
          {i > 0 && (
            <button
              onClick={() => onInsert(i)}
              title="Insert step before"
              className="w-5 h-5 flex items-center justify-center rounded text-white/20 hover:text-white hover:bg-white/10 text-xs transition-colors"
            >
              +
            </button>
          )}

          {/* Step tab */}
          <div className="relative group">
            <button
              onClick={() => onSelect(i)}
              className={`px-3 py-1 rounded text-xs font-medium transition-all min-h-9 min-w-[52px] ${
                activeIndex === i
                  ? 'bg-white text-[#0a0f1a]'
                  : 'text-white/50 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              Step {i + 1}
            </button>

            {/* Delete button — only when more than 1 step */}
            {steps.length > 1 && (
              <button
                onClick={e => { e.stopPropagation(); onDelete(i); }}
                title="Delete step"
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500/80 text-white text-[9px] items-center justify-center hidden group-hover:flex transition-all"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Add step */}
      <button
        onClick={onAdd}
        title="Add step"
        className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded border border-dashed border-white/20 text-white/30 hover:text-white hover:border-white/50 text-lg transition-colors"
      >
        +
      </button>
    </div>
  );
}
