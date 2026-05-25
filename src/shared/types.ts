import type { PlayData } from '../types';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface PlayRecord {
  id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  category: string;
  is_library_play: boolean;
  published: boolean;
  created_by: string | null;
  play_data: PlayData;
  created_at: string;
}
