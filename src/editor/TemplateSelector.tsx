import { useState } from 'react';
import { TEMPLATES } from './templates';
import type { FieldZone, PlayerData } from '../types';

interface TemplateSelectorProps {
  onSelect: (players: PlayerData[], zone: FieldZone) => void;
  onClose: () => void;
}

const GROUPS = ['Scrums', 'Lineouts', 'Restarts', 'Blank'] as const;
type GroupTab = typeof GROUPS[number];

export function TemplateSelector({ onSelect, onClose }: TemplateSelectorProps) {
  const [activeGroup, setActiveGroup] = useState<GroupTab>('Scrums');

  const filtered = TEMPLATES.filter(t => t.group === activeGroup);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-[#111827] border border-white/10 rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-white font-semibold">Choose Formation</h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white text-xl w-8 h-8 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Group tabs */}
        <div className="flex gap-1 p-3 border-b border-white/10">
          {GROUPS.map(g => (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all min-h-9 ${
                activeGroup === g
                  ? 'bg-white text-[#0a0f1a]'
                  : 'text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Template list */}
        <div className="p-3 flex flex-col gap-2 max-h-80 overflow-y-auto">
          {filtered.map(t => (
            <button
              key={t.id}
              onClick={() => onSelect(t.players.map(p => ({ ...p, has_ball: false })), t.zone)}
              className="flex items-start gap-3 p-3 rounded-lg border border-white/10 hover:border-white/30 hover:bg-white/5 text-left transition-all"
            >
              <div>
                <p className="text-white text-sm font-medium">{t.name}</p>
                {t.description && (
                  <p className="text-white/40 text-xs mt-0.5">{t.description}</p>
                )}
              </div>
              <span className="ml-auto text-white/20 text-xs flex-shrink-0 mt-0.5">{t.zone.replace('_', ' ')}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
