import type { PlayRecord } from '../shared/types';

export interface Team {
  id: string;
  name: string;
  slug: string;
  created_by: string;
  plan: string;
  created_at: string;
}

export type CoachRole = 'owner' | 'coach';

export interface TeamDashboardData {
  team: Team;
  teamPlays: TeamPlayEntry[];
  role: CoachRole;
}

export interface TeamPlayEntry {
  play_id: string;
  sort_order: number;
  plays: PlayRecord;
}

export interface TeamPlaybookData {
  team: Pick<Team, 'id' | 'name'>;
  plays: PlayRecord[];
}
