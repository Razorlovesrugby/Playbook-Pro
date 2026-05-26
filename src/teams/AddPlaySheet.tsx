import { useEffect, useState } from 'react';
import { PlayThumbnail } from '../library/PlayThumbnail';
import type { PlayRecord } from '../shared/types';
import type { TeamPlayEntry } from './types';
import { loadMyPlaysForTeam } from './teamApi';

interface AddPlaySheetProps {
  userId: string;
  existingPlays: TeamPlayEntry[];
  onAdd: (play: PlayRecord) => Promise<void>;
  onClose: () => void;
}

export function AddPlaySheet({ userId, existingPlays, onAdd, onClose }: AddPlaySheetProps) {
  const [plays, setPlays] = useState<PlayRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);

  const existingIds = new Set(existingPlays.map(tp => tp.play_id));

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await loadMyPlaysForTeam(userId);
        setPlays(data);
      } catch (err) {
        setError('Could not load your plays.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [userId]);

  async function handleAdd(play: PlayRecord) {
    setAdding(play.id);
    try {
      await onAdd(play);
    } finally {
      setAdding(null);
    }
  }

  const available = plays.filter(p => !existingIds.has(p.id));

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-[#111827] border border-white/10 rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-white font-semibold">Add a play to your team</h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white text-lg min-h-11 min-w-11 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading && <p className="text-white/40 text-sm text-center py-8">Loading your plays…</p>}
          {error && <p className="text-white/50 text-sm text-center py-8">{error}</p>}

          {!loading && !error && available.length === 0 && (
            <div className="text-center py-8">
              <p className="text-white/50 text-sm">
                {plays.length === 0
                  ? 'You have no saved plays yet. Create one in the Editor first.'
                  : 'All your plays are already in the team playbook.'}
              </p>
            </div>
          )}

          {!loading && !error && available.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {available.map(play => (
                <button
                  key={play.id}
                  onClick={() => void handleAdd(play)}
                  disabled={adding === play.id}
                  className="group text-left rounded-lg border border-white/10 overflow-hidden hover:border-white/30 transition-all bg-white/5 disabled:opacity-50"
                >
                  <div className="aspect-video bg-[#0a0f1a] relative overflow-hidden">
                    <PlayThumbnail play={play} />
                    {adding === play.id && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-xs">Adding…</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-white text-xs font-medium line-clamp-2">{play.title}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
