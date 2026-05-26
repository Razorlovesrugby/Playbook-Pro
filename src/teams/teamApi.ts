import { supabase } from '../shared/supabase';
import type { PlayRecord } from '../shared/types';
import type { Team, TeamDashboardData, TeamPlaybookData } from './types';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function createTeam(name: string, userId: string): Promise<Team> {
  if (!supabase) throw new Error('Supabase not configured');

  const slug = `${slugify(name)}-${Math.random().toString(36).slice(2, 8)}`;

  const { data: team, error: teamError } = await supabase
    .from('teams')
    .insert({ name, slug, created_by: userId })
    .select()
    .single();

  if (teamError) throw teamError;

  const { error: coachError } = await supabase
    .from('team_coaches')
    .insert({ team_id: (team as Team).id, user_id: userId, role: 'owner' });

  if (coachError) throw coachError;

  return team as Team;
}

export async function loadTeamDashboard(userId: string): Promise<TeamDashboardData | null> {
  if (!supabase) throw new Error('Supabase not configured');

  const { data: membership, error } = await supabase
    .from('team_coaches')
    .select('team_id, role, teams(*)')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!membership) return null;

  const team = (membership as unknown as { teams: Team }).teams;

  const { data: rawPlays, error: playsError } = await supabase
    .from('team_plays')
    .select('play_id, sort_order, plays(id, title, slug, difficulty, category, play_data, created_at, is_library_play, published, created_by)')
    .eq('team_id', team.id)
    .order('sort_order');

  if (playsError) throw playsError;

  const teamPlays = ((rawPlays ?? []) as unknown as Array<{
    play_id: string;
    sort_order: number;
    plays: PlayRecord;
  }>).filter(tp => tp.plays != null);

  return {
    team,
    teamPlays,
    role: (membership as unknown as { role: 'owner' | 'coach' }).role,
  };
}

export async function updateTeamName(teamId: string, name: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('teams').update({ name }).eq('id', teamId);
  if (error) throw error;
}

export async function publishPlayToTeam(
  teamId: string,
  playId: string,
  publishedBy: string,
  nextSortOrder: number,
): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');

  // Ensure play is publicly viewable
  await supabase.from('plays').update({ published: true }).eq('id', playId);

  const { error } = await supabase.from('team_plays').insert({
    team_id: teamId,
    play_id: playId,
    published_by: publishedBy,
    sort_order: nextSortOrder,
  });
  if (error) throw error;
}

export async function removePlayFromTeam(teamId: string, playId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase
    .from('team_plays')
    .delete()
    .eq('team_id', teamId)
    .eq('play_id', playId);
  if (error) throw error;
}

export async function reorderTeamPlays(teamId: string, orderedPlayIds: string[]): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  await Promise.all(
    orderedPlayIds.map((playId, index) =>
      supabase!
        .from('team_plays')
        .update({ sort_order: index })
        .eq('team_id', teamId)
        .eq('play_id', playId),
    ),
  );
}

export async function loadTeamPlaybook(teamSlug: string): Promise<TeamPlaybookData | null> {
  if (!supabase) throw new Error('Supabase not configured');

  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('id, name')
    .eq('slug', teamSlug)
    .maybeSingle();

  if (teamError) throw teamError;
  if (!team) return null;

  const { data: rawPlays, error: playsError } = await supabase
    .from('team_plays')
    .select('sort_order, plays(id, title, slug, difficulty, category, play_data, created_at, is_library_play, published, created_by)')
    .eq('team_id', (team as Pick<Team, 'id' | 'name'>).id)
    .order('sort_order');

  if (playsError) throw playsError;

  const plays = ((rawPlays ?? []) as unknown as Array<{ plays: PlayRecord }>)
    .map(tp => tp.plays)
    .filter((p): p is PlayRecord => p != null && p.play_data != null);

  return { team: team as Pick<Team, 'id' | 'name'>, plays };
}

export async function loadMyPlaysForTeam(userId: string): Promise<PlayRecord[]> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('plays')
    .select('id, title, slug, difficulty, category, play_data, created_at, is_library_play, published, created_by')
    .eq('created_by', userId)
    .eq('is_library_play', false)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return ((data ?? []).filter(p => p.play_data != null)) as PlayRecord[];
}
