import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../shared/supabase';
import type { PlayRecord } from '../shared/types';
import { Badges } from '../viewer/Badges';
import { PlayThumbnail } from '../library/PlayThumbnail';
import { Navbar } from './Navbar';
import { useAuth } from './auth';

function MyPlayCard({ play }: { play: PlayRecord }) {
  const navigate = useNavigate();
  const stepCount = play.play_data?.steps?.length ?? 0;

  return (
    <button
      onClick={() => navigate(`/editor/${play.id}`)}
      className="group text-left rounded-lg border border-white/10 overflow-hidden hover:border-white/30 transition-all bg-white/5 hover:bg-white/8 w-full"
    >
      <div className="aspect-video bg-[#0a0f1a] relative overflow-hidden">
        <PlayThumbnail play={play} />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white font-medium text-sm">Edit</span>
        </div>
        {!play.published && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] uppercase font-medium bg-black/60 text-white/70 border border-white/20">
            Draft
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-white font-semibold text-sm leading-tight mb-2 line-clamp-2">{play.title}</h3>
        <Badges difficulty={play.difficulty} category={play.category} />
        {stepCount > 0 && <p className="text-white/30 text-xs mt-2">{stepCount} steps</p>}
      </div>
    </button>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-lg border border-white/10 overflow-hidden bg-white/5 animate-pulse">
      <div className="aspect-video bg-white/5" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-white/10 rounded w-3/4" />
        <div className="h-3 bg-white/5 rounded w-1/2" />
      </div>
    </div>
  );
}

export function MyPlaysPage() {
  const { user } = useAuth();
  const [plays, setPlays] = useState<PlayRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase || !user) return;
    const client = supabase;
    const userId = user.id;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data, error: dbError } = await client
          .from('plays')
          .select('id, title, slug, difficulty, category, play_data, created_at, is_library_play, published, created_by')
          .eq('created_by', userId)
          .eq('is_library_play', false)
          .order('created_at', { ascending: false });
        if (dbError) throw dbError;
        setPlays((data ?? []).filter(p => p.play_data != null) as PlayRecord[]);
      } catch (err) {
        setError('Could not load your plays. Check your connection.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-white/30 text-xs uppercase tracking-widest mb-2">MY PLAYS</p>
            <h1 className="text-3xl font-bold">Your saved plays</h1>
          </div>
          <Link
            to="/editor"
            className="px-3 py-2 bg-white text-[#0a0f1a] text-sm font-semibold rounded hover:bg-white/90 min-h-11 flex items-center flex-shrink-0"
          >
            Create Play
          </Link>
        </div>

        {error && <p className="text-white/50">{error}</p>}

        {!error && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            ) : plays.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <p className="text-white/50 mb-2">You haven&apos;t saved any plays yet.</p>
                <p className="text-white/30 text-sm mb-4">
                  Browse the library and tap &ldquo;Use this play&rdquo;, or create your own.
                </p>
                <Link to="/moves" className="text-white/50 underline text-sm hover:text-white">
                  Browse Moves
                </Link>
              </div>
            ) : (
              plays.map(p => <MyPlayCard key={p.id} play={p} />)
            )}
          </div>
        )}
      </div>
    </div>
  );
}
