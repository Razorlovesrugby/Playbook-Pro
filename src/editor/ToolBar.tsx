import type { EditorTool } from './useEditorState';

interface ToolDef {
  id: EditorTool;
  icon: string;
  label: string;
  shortcut: string;
}

const TOOLS: ToolDef[] = [
  { id: 'select', icon: '↖', label: 'Select',  shortcut: 'V' },
  { id: 'run',    icon: '─',  label: 'Run',     shortcut: 'R' },
  { id: 'pass',   icon: '⤳',  label: 'Pass',    shortcut: 'P' },
  { id: 'arrow',  icon: '↗',  label: 'Arrow',   shortcut: 'A' },
  { id: 'circle', icon: '○',  label: 'Circle',  shortcut: 'C' },
  { id: 'text',   icon: 'T',  label: 'Text',    shortcut: 'T' },
  { id: 'target', icon: '⊕',  label: 'Target',  shortcut: 'X' },
  { id: 'eraser', icon: '✕',  label: 'Eraser',  shortcut: 'E' },
];

// Divider after select, after pass
const DIVIDER_AFTER: EditorTool[] = ['select', 'pass', 'target'];

interface ToolBarProps {
  activeTool: EditorTool;
  onChange: (t: EditorTool) => void;
  orientation?: 'vertical' | 'horizontal';
}

export function ToolBar({ activeTool, onChange, orientation = 'vertical' }: ToolBarProps) {
  const isVertical = orientation === 'vertical';

  return (
    <div
      className={`flex gap-1 p-2 bg-[#111827] border-white/10 ${
        isVertical ? 'flex-col border-r' : 'flex-row border-b overflow-x-auto'
      }`}
    >
      {TOOLS.map((tool, i) => (
        <div key={tool.id} className={isVertical ? '' : 'flex items-center'}>
          {isVertical && i > 0 && DIVIDER_AFTER.includes(TOOLS[i - 1]?.id ?? 'select') && (
            <div className="border-t border-white/10 my-1" />
          )}
          {!isVertical && i > 0 && DIVIDER_AFTER.includes(TOOLS[i - 1]?.id ?? 'select') && (
            <div className="border-l border-white/10 mx-1 h-6" />
          )}
          <button
            key={tool.id}
            onClick={() => onChange(tool.id)}
            title={`${tool.label} (${tool.shortcut})`}
            className={`
              flex items-center justify-center rounded transition-colors
              ${isVertical ? 'w-10 h-10' : 'w-10 h-10 flex-shrink-0'}
              ${activeTool === tool.id
                ? 'bg-white text-[#0a0f1a]'
                : 'text-white/50 hover:text-white hover:bg-white/10'
              }
            `}
          >
            <span className="text-base leading-none">{tool.icon}</span>
          </button>
        </div>
      ))}
    </div>
  );
}
