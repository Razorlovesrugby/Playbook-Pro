import { useEffect, useState, useCallback } from 'react';
import { Navbar } from '../auth';
import { useAuth } from '../auth';
import type { TeamDashboardData } from './types';
import { loadTeamDashboard, createTeam } from './teamApi';
import { TeamSetup } from './TeamSetup';
import { TeamDashboard } from './TeamDashboard';

type LoadState = 'loading' | 'error' | 'no_team' | 'ready';

export function TeamPage() {
  const { user } = useAuth();
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [dashData, setDashData] = useState<TeamDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoadState('loading');
    setError(null);
    try {
      const data = await loadTeamDashboard(user.id);
      if (data) {
        setDashData(data);
        setLoadState('ready');
      } else {
        setLoadState('no_team');
      }
    } catch (err) {
      console.error(err);
      setError('Could not load your team. Check your connection.');
      setLoadState('error');
    }
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  async function handleCreateTeam(name: string) {
    if (!user) return;
    await createTeam(name, user.id);
    await load();
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-12">

        {loadState === 'loading' && (
          <div className="space-y-4 animate-pulse">
            <div className="h-6 bg-white/5 rounded w-48" />
            <div className="h-4 bg-white/5 rounded w-32" />
            <div className="h-16 bg-white/5 rounded" />
            <div className="h-16 bg-white/5 rounded" />
          </div>
        )}

        {loadState === 'error' && (
          <div className="text-center py-16">
            <p className="text-white/50 mb-4">{error}</p>
            <button
              onClick={() => void load()}
              className="px-4 py-2 border border-white/20 rounded text-white/60 hover:text-white text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {loadState === 'no_team' && (
          <TeamSetup onSubmit={handleCreateTeam} />
        )}

        {loadState === 'ready' && dashData && user && (
          <TeamDashboard data={dashData} user={user} onRefresh={load} />
        )}
      </div>
    </div>
  );
}
