import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PlayCard } from '../library/PlayCard';
import { Navbar } from '../auth';
import type { TeamPlaybookData } from './types';
import { loadTeamPlaybook } from './teamApi';

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

type LoadState = 'loading' | 'not_found' | 'error' | 'ready';

export function TeamPlaybookPage() {
  const { teamSlug } = useParams<{ teamSlug: string }>();
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [data, setData] = useState<TeamPlaybookData | null>(null);

  useEffect(() => {
    if (!teamSlug) { setLoadState('not_found'); return; }

    async function load() {
      setLoadState('loading');
      try {
        const result = await loadTeamPlaybook(teamSlug!);
        if (!result) {
          setLoadState('not_found');
        } else {
          setData(result);
          setLoadState('ready');
        }
      } catch (err) {
        console.error(err);
        setLoadState('error');
      }
    }

    void load();
  }, [teamSlug]);

  const renderContent = () => {
    if (loadState === 'loading') {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      );
    }

    if (loadState === 'not_found') {
      return (
        <div className="text-center py-16">
          <p className="text-white/50 mb-2">This team&apos;s playbook doesn&apos;t exist.</p>
          <p className="text-white/30 text-sm">Check the link and try again.</p>
        </div>
      );
    }

    if (loadState === 'error') {
      return (
        <div className="text-center py-16">
          <p className="text-white/50">Could not load this team&apos;s playbook. Check your connection.</p>
        </div>
      );
    }

    if (data && data.plays.length === 0) {
      return (
        <div className="text-center py-16">
          <p className="text-white/50">Your coach hasn&apos;t published any plays yet.</p>
          <p className="text-white/30 text-sm mt-1">Check back soon.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {data!.plays.map(play => <PlayCard key={play.id} play={play} />)}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <p className="text-white/30 text-xs uppercase tracking-widest mb-2">TEAM PLAYBOOK</p>
          <h1 className="text-white text-3xl font-bold">
            {data ? data.team.name : loadState === 'loading' ? '…' : 'Team Playbook'}
          </h1>
          {loadState === 'ready' && (
            <p className="text-white/50 text-sm mt-1">Browse and watch your team&apos;s plays.</p>
          )}
        </div>

        {renderContent()}
      </div>
    </div>
  );
}
