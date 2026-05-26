import { useState, useEffect } from 'react';
import { useDebounce } from '../shared/hooks';

export interface LibraryFilters {
  difficulty: string;
  category: string;
  search: string;
}

interface FilterBarProps {
  onFilter: (filters: LibraryFilters) => void;
}

const CATEGORIES = ['All', 'Attack Structure', 'Set Piece', 'Defence', 'Kick Game', 'Restarts'];
const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-full text-xs font-medium transition-all min-h-[44px] flex items-center
        ${active
          ? 'bg-white text-[#0a0f1a]'
          : 'border border-white/20 text-white/50 hover:text-white hover:border-white/40'
        }`}
    >
      {label}
    </button>
  );
}

export function FilterBar({ onFilter }: FilterBarProps) {
  const [difficulty, setDifficulty] = useState('All');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    onFilter({ difficulty, category, search: debouncedSearch });
  // onFilter is stable (useCallback in parent); include for lint correctness
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, category, debouncedSearch]);

  return (
    <div className="space-y-3 mb-6">
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search plays…"
        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white placeholder-white/30 text-sm outline-none focus:border-white/30"
      />
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-white/30 text-xs self-center">Level:</span>
        {DIFFICULTIES.map(d => (
          <FilterChip key={d} label={d} active={difficulty === d} onClick={() => setDifficulty(d)} />
        ))}
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-white/30 text-xs self-center">Type:</span>
        {CATEGORIES.map(c => (
          <FilterChip key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
        ))}
      </div>
    </div>
  );
}
