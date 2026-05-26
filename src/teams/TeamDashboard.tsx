import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import type { TeamDashboardData, TeamPlayEntry } from './types';
import type { PlayRecord } from '../shared/types';
import { TeamPlayRow } from './TeamPlayRow';
import { TeamLinkButton } from './TeamLinkButton';
import { AddPlaySheet } from './AddPlaySheet';
import {
  publishPlayToTeam,
  removePlayFromTeam,
  reorderTeamPlays,
  updateTeamName,
} from './teamApi';

interface TeamDashboardProps {
  data: TeamDashboardData;
  user: User;
  onRefresh: () => void;
}

export function TeamDashboard({ data, user, onRefresh }: TeamDashboardProps) {
  const { team } = data;
  const [teamPlays, setTeamPlays] = useState<TeamPlayEntry[]>(data.teamPlays);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [teamName, setTeamName] = useState(team.name);
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  async function handleAddPlay(play: PlayRecord) {
    try {
      await publishPlayToTeam(team.id, play.id, user.id, teamPlays.length);
      // Optimistically add to list
      setTeamPlays(prev => [...prev, {
        play_id: play.id,
        sort_order: prev.length,
        plays: play,
      }]);
      setShowAddSheet(false);
    } catch (err) {
      console.error(err);
      alert('Could not add play. Please try again.');
    }
  }

  async function handleRemove(playId: string) {
    try {
      await removePlayFromTeam(team.id, playId);
      setTeamPlays(prev => {
        const next = prev.filter(tp => tp.play_id !== playId);
        return next.map((tp, i) => ({ ...tp, sort_order: i }));
      });
    } catch (err) {
      console.error(err);
      alert('Could not remove play. Please try again.');
      onRefresh();
    }
  }

  async function handleMove(index: number, direction: 'up' | 'down') {
    const newPlays = [...teamPlays];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const a = newPlays[index]!;
    const b = newPlays[swapIndex]!;
    newPlays[index] = b;
    newPlays[swapIndex] = a;
    const reordered = newPlays.map((tp, i) => ({ ...tp, sort_order: i }));
    setTeamPlays(reordered);
    try {
      await reorderTeamPlays(team.id, reordered.map(tp => tp.play_id));
    } catch (err) {
      console.error(err);
      onRefresh();
    }
  }

  async function handleSaveName() {
    const trimmed = teamName.trim();
    if (!trimmed) {
      setNameError('Team name cannot be empty.');
      return;
    }
    setNameError(null);
    setSavingName(true);
    try {
      await updateTeamName(team.id, trimmed);
    } catch (err) {
      console.error(err);
      setNameError('Could not save. Please try again.');
    } finally {
      setSavingName(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-white/30 text-xs uppercase tracking-widest mb-1">TEAM DASHBOARD</p>
          <h1 className="text-white text-2xl font-bold">{team.name}</h1>
          <p className="text-white/40 text-xs mt-1">Free Plan · {teamPlays.length} play{teamPlays.length !== 1 ? 's' : ''} published</p>
        </div>
        <TeamLinkButton teamSlug={team.slug} />
      </div>

      {/* Team Playbook section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white/70 text-sm font-semibold uppercase tracking-wider">Team Playbook</h2>
          <button
            onClick={() => setShowAddSheet(true)}
            className="flex items-center gap-1 px-3 py-2 bg-white text-[#0a0f1a] text-sm font-semibold rounded hover:bg-white/90 min-h-11"
          >
            + Add Play
          </button>
        </div>

        {teamPlays.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-lg">
            <p className="text-white/40 text-sm mb-2">No plays in your team playbook yet.</p>
            <p className="text-white/30 text-xs">
              Click &ldquo;+ Add Play&rdquo; to publish plays from My Plays to your team.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {teamPlays.map((entry, index) => (
              <TeamPlayRow
                key={entry.play_id}
                entry={entry}
                index={index}
                total={teamPlays.length}
                onRemove={() => void handleRemove(entry.play_id)}
                onMoveUp={() => void handleMove(index, 'up')}
                onMoveDown={() => void handleMove(index, 'down')}
              />
            ))}
          </div>
        )}
      </div>

      {/* Team Settings section */}
      <div className="pt-4 border-t border-white/10">
        <h2 className="text-white/70 text-sm font-semibold uppercase tracking-wider mb-3">Team Settings</h2>
        <div className="flex gap-2 items-start max-w-sm">
          <div className="flex-1">
            <input
              type="text"
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              placeholder="Team name"
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm outline-none focus:border-white/30"
            />
            {nameError && <p className="text-red-400 text-xs mt-1">{nameError}</p>}
          </div>
          <button
            onClick={() => void handleSaveName()}
            disabled={savingName || teamName.trim() === team.name}
            className="px-3 py-2 border border-white/20 rounded text-white/60 text-sm hover:text-white hover:border-white/40 disabled:opacity-40 min-h-11 flex-shrink-0"
          >
            {savingName ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {showAddSheet && (
        <AddPlaySheet
          userId={user.id}
          existingPlays={teamPlays}
          onAdd={play => handleAddPlay(play)}
          onClose={() => setShowAddSheet(false)}
        />
      )}
    </div>
  );
}
