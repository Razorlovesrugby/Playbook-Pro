import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../shared/supabase';
import type { PlayRecord } from '../shared/types';
import { Navbar } from '../auth';
import { FilterBar, type LibraryFilters } from './FilterBar';
import { PlayCard } from './PlayCard';

function SkeletonCard() {
  return (
    <div className="rounded-lg border border-white/10 overflow-hidden bg-white/5 animate-pulse">
      <div className="aspect-video bg-white/5" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-white/10 rounded w-3/4" />
        <div className="h-3 bg-white/5 rounded w-1/2" />
        <div className="h-3 bg-white/5 rounded w-1/4" />
      </div>
    </div>
  );
}

interface EmptyStateProps {
  search: string;
  onClear: () => void;
}

function EmptyState({ search, onClear }: EmptyStateProps) {
  if (search) {
    return (
      <div className="col-span-full text-center py-16">
        <p className="text-white/50 mb-2">No plays found for &ldquo;{search}&rdquo;</p>
        <p className="text-white/30 text-sm mb-4">Try different keywords or browse all plays.</p>
        <button onClick={onClear} className="text-white/50 underline text-sm hover:text-white transition-colors">
          Clear search
        </button>
      </div>
    );
  }
  return (
    <div className="col-span-full text-center py-16">
      <p className="text-white/50 mb-2">No plays match your filters.</p>
      <p className="text-white/30 text-sm mb-4">Try adjusting the difficulty or category.</p>
      <button onClick={onClear} className="text-white/50 underline text-sm hover:text-white transition-colors">
        Clear filters
      </button>
    </div>
  );
}

async function fetchLibraryPlays(filters: LibraryFilters): Promise<PlayRecord[]> {
  if (!supabase) throw new Error('Supabase not configured');

  let query = supabase
    .from('plays')
    .select('id, title, slug, difficulty, category, play_data, created_at, is_library_play, published, created_by')
    .eq('is_library_play', true)
    .eq('published', true)
    .order('created_at', { ascending: true });

  if (filters.difficulty !== 'All') {
    query = query.eq('difficulty', filters.difficulty.toLowerCase());
  }
  if (filters.category !== 'All') {
    query = query.eq('category', filters.category);
  }
  if (filters.search) {
    query = query.ilike('title', `%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).filter(p => p.play_data != null) as PlayRecord[];
}

export function LibraryPage() {
  const [plays, setPlays] = useState<PlayRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LibraryFilters>({ difficulty: 'All', category: 'All', search: '' });

  const load = useCallback(async (f: LibraryFilters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLibraryPlays(f);
      setPlays(data);
    } catch (err) {
      setError('Could not load plays. Check your connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(filters);
  }, [filters, load]);

  const handleFilter = useCallback((f: LibraryFilters) => {
    setFilters(prev => {
      if (
        prev.difficulty === f.difficulty &&
        prev.category === f.category &&
        prev.search === f.search
      ) return prev;
      return f;
    });
  }, []);

  const handleClear = useCallback(() => {
    setFilters({ difficulty: 'All', category: 'All', search: '' });
  }, []);

  const isEmpty = !loading && !error && plays.length === 0;

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <p className="text-white/30 text-xs uppercase tracking-widest mb-2">MOVES</p>
          <h1 className="text-white text-3xl font-bold mb-2">Animated Rugby Plays</h1>
          <p className="text-white/50 text-sm">
            Browse the play library. Watch plays animate, then save to your collection.
          </p>
        </div>

        <FilterBar onFilter={handleFilter} />

        {error && (
          <div className="text-center py-16">
            <p className="text-white/50 mb-4">{error}</p>
            <button
              onClick={() => load(filters)}
              className="px-4 py-2 border border-white/20 rounded text-white/70 hover:text-white hover:border-white/40 text-sm transition-all"
            >
              Retry
            </button>
          </div>
        )}

        {!error && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : isEmpty
              ? <EmptyState search={filters.search} onClear={handleClear} />
              : plays.map(play => <PlayCard key={play.id} play={play} />)
            }
          </div>
        )}
      </div>
    </div>
  );
}
