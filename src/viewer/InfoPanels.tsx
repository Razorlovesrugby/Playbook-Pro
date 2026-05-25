import { useState } from 'react';
import type { PlayInfo } from '../types';
import { useMediaQuery } from '../shared/hooks';

const SECTIONS: { key: keyof PlayInfo; label: string }[] = [
  { key: 'what_is_it',           label: 'What Is It?' },
  { key: 'when_to_use',          label: 'When to Use' },
  { key: 'why_it_works',         label: 'Why It Works' },
  { key: 'key_positions',        label: 'Key Positions' },
  { key: 'options_alternatives', label: 'Options & Alternatives' },
  { key: 'common_mistakes',      label: 'Common Mistakes' },
];

interface InfoPanelsProps {
  info: PlayInfo | undefined;
}

export function InfoPanels({ info }: InfoPanelsProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const [expanded, setExpanded] = useState<Set<keyof PlayInfo>>(
    () => new Set(isDesktop ? SECTIONS.map(s => s.key) : []),
  );

  if (!info) return null;

  const populated = SECTIONS.filter(s => !!info[s.key]);
  if (populated.length === 0) return null;

  const toggle = (key: keyof PlayInfo) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  return (
    <div className="mt-6 space-y-1">
      {populated.map(section => {
        const isOpen = expanded.has(section.key);
        return (
          <div key={section.key} className="border border-white/10 rounded">
            <button
              onClick={() => toggle(section.key)}
              className="w-full flex justify-between items-center p-4 text-left text-white/80 hover:text-white text-sm font-medium uppercase tracking-wide min-h-11"
            >
              {section.label}
              <span className="text-white/40 text-lg leading-none">
                {isOpen ? '−' : '+'}
              </span>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 text-white/60 text-sm leading-relaxed">
                {info[section.key]}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
