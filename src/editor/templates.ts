import type { PlayerData, FieldZone } from '../types';

export interface Template {
  id: string;
  name: string;
  zone: FieldZone;
  group: 'Scrums' | 'Lineouts' | 'Restarts' | 'Blank';
  description: string;
  players: Omit<PlayerData, 'has_ball'>[];
}

// ─── Helper ────────────────────────────────────────────────────────────────

function p(id: string, number: number, team: 'attack' | 'defence', x: number, y: number): Omit<PlayerData, 'has_ball'> {
  return { id, number, team, x, y };
}

// ─── Templates ─────────────────────────────────────────────────────────────

export const TEMPLATES: Template[] = [
  // ── Blank ──────────────────────────────────────────────────────────────
  {
    id: 'blank',
    name: 'Blank Field',
    zone: 'full',
    group: 'Blank',
    description: 'Empty canvas — place players manually',
    players: [],
  },

  // ── Scrum Centre (Opp 22) ──────────────────────────────────────────────
  {
    id: 'scrum_centre',
    name: 'Scrum Centre',
    zone: 'opp_22',
    group: 'Scrums',
    description: 'Scrum in the middle of the Opp 22',
    players: [
      // Attack forwards — scrum at x=50, y=22
      p('a1', 1,  'attack', 47, 22), p('a2', 2,  'attack', 50, 22), p('a3', 3,  'attack', 53, 22),
      p('a4', 4,  'attack', 47, 25), p('a5', 5,  'attack', 53, 25),
      p('a6', 6,  'attack', 43, 24), p('a7', 7,  'attack', 57, 24),
      p('a8', 8,  'attack', 50, 27),
      // Attack backs
      p('a9',  9,  'attack', 56, 29), // ball carrier (has_ball set below in EditorPage)
      p('a10', 10, 'attack', 38, 32),
      p('a12', 12, 'attack', 28, 36),
      p('a13', 13, 'attack', 18, 38),
      p('a11', 11, 'attack',  8, 20),
      p('a14', 14, 'attack', 82, 20),
      p('a15', 15, 'attack', 50, 16),
      // Defence
      p('d1', 1, 'defence', 45, 14), p('d2', 2, 'defence', 50, 14),
      p('d3', 3, 'defence', 55, 14), p('d4', 4, 'defence', 38, 18),
      p('d5', 5, 'defence', 62, 18),
    ],
  },

  // ── Scrum Left (Opp 22) ───────────────────────────────────────────────
  {
    id: 'scrum_left',
    name: 'Scrum Left',
    zone: 'opp_22',
    group: 'Scrums',
    description: 'Scrum near the left touchline in Opp 22',
    players: [
      p('a1', 1,  'attack', 22, 22), p('a2', 2,  'attack', 25, 22), p('a3', 3,  'attack', 28, 22),
      p('a4', 4,  'attack', 22, 25), p('a5', 5,  'attack', 28, 25),
      p('a6', 6,  'attack', 18, 24), p('a7', 7,  'attack', 32, 24),
      p('a8', 8,  'attack', 25, 27),
      p('a9',  9,  'attack', 32, 29),
      p('a10', 10, 'attack', 42, 32),
      p('a12', 12, 'attack', 54, 36),
      p('a13', 13, 'attack', 66, 38),
      p('a11', 11, 'attack',  8, 16),
      p('a14', 14, 'attack', 82, 20),
      p('a15', 15, 'attack', 50, 16),
      p('d1', 1, 'defence', 20, 14), p('d2', 2, 'defence', 26, 14),
      p('d3', 3, 'defence', 32, 14), p('d4', 4, 'defence', 40, 18),
      p('d5', 5, 'defence', 55, 18),
    ],
  },

  // ── Scrum Right (Opp 22) ──────────────────────────────────────────────
  {
    id: 'scrum_right',
    name: 'Scrum Right',
    zone: 'opp_22',
    group: 'Scrums',
    description: 'Scrum near the right touchline in Opp 22',
    players: [
      p('a1', 1,  'attack', 72, 22), p('a2', 2,  'attack', 75, 22), p('a3', 3,  'attack', 78, 22),
      p('a4', 4,  'attack', 72, 25), p('a5', 5,  'attack', 78, 25),
      p('a6', 6,  'attack', 68, 24), p('a7', 7,  'attack', 82, 24),
      p('a8', 8,  'attack', 75, 27),
      p('a9',  9,  'attack', 68, 29),
      p('a10', 10, 'attack', 58, 32),
      p('a12', 12, 'attack', 46, 36),
      p('a13', 13, 'attack', 34, 38),
      p('a11', 11, 'attack',  8, 20),
      p('a14', 14, 'attack', 92, 16),
      p('a15', 15, 'attack', 50, 16),
      p('d1', 1, 'defence', 68, 14), p('d2', 2, 'defence', 74, 14),
      p('d3', 3, 'defence', 80, 14), p('d4', 4, 'defence', 60, 18),
      p('d5', 5, 'defence', 45, 18),
    ],
  },

  // ── Lineout Left (Opp Half) ───────────────────────────────────────────
  {
    id: 'lineout_left',
    name: 'Lineout Left',
    zone: 'opp_half',
    group: 'Lineouts',
    description: 'Lineout on the left touchline, attacking half',
    players: [
      // Lineout line at x=12, from y=30 to y=46
      p('a1', 1,  'attack', 12, 30),
      p('a3', 3,  'attack', 12, 33),
      p('a4', 4,  'attack', 12, 36),
      p('a5', 5,  'attack', 12, 39),
      p('a6', 6,  'attack', 12, 42),
      p('a7', 7,  'attack', 12, 45),
      p('a8', 8,  'attack', 12, 48),
      // Hooker throws
      p('a2', 2,  'attack',  4, 40),
      // 9 at the tail
      p('a9',  9,  'attack', 12, 51),
      // Backs
      p('a10', 10, 'attack', 26, 48),
      p('a12', 12, 'attack', 38, 46),
      p('a13', 13, 'attack', 50, 44),
      p('a11', 11, 'attack',  6, 26),
      p('a14', 14, 'attack', 70, 40),
      p('a15', 15, 'attack', 50, 34),
      // Defence
      p('d1', 1, 'defence', 18, 30), p('d2', 2, 'defence', 18, 35),
      p('d3', 3, 'defence', 18, 40), p('d4', 4, 'defence', 18, 45),
      p('d5', 5, 'defence', 30, 44),
    ],
  },

  // ── Lineout Right (Opp Half) ──────────────────────────────────────────
  {
    id: 'lineout_right',
    name: 'Lineout Right',
    zone: 'opp_half',
    group: 'Lineouts',
    description: 'Lineout on the right touchline, attacking half',
    players: [
      p('a1', 1,  'attack', 88, 30),
      p('a3', 3,  'attack', 88, 33),
      p('a4', 4,  'attack', 88, 36),
      p('a5', 5,  'attack', 88, 39),
      p('a6', 6,  'attack', 88, 42),
      p('a7', 7,  'attack', 88, 45),
      p('a8', 8,  'attack', 88, 48),
      p('a2', 2,  'attack', 96, 40),
      p('a9',  9,  'attack', 88, 51),
      p('a10', 10, 'attack', 74, 48),
      p('a12', 12, 'attack', 62, 46),
      p('a13', 13, 'attack', 50, 44),
      p('a11', 11, 'attack', 30, 40),
      p('a14', 14, 'attack', 94, 26),
      p('a15', 15, 'attack', 50, 34),
      p('d1', 1, 'defence', 82, 30), p('d2', 2, 'defence', 82, 35),
      p('d3', 3, 'defence', 82, 40), p('d4', 4, 'defence', 82, 45),
      p('d5', 5, 'defence', 70, 44),
    ],
  },

  // ── Kickoff Left (Own Half) ───────────────────────────────────────────
  {
    id: 'kickoff_left',
    name: 'Kick Off Left',
    zone: 'own_half',
    group: 'Restarts',
    description: 'Kickoff — kicker on left, attack spread across halfway',
    players: [
      // Kicker (10) at halfway, slightly left
      p('a10', 10, 'attack', 42, 50),
      // Forwards spread across halfway
      p('a1', 1,  'attack', 32, 52), p('a2', 2,  'attack', 37, 52),
      p('a3', 3,  'attack', 47, 52), p('a4', 4,  'attack', 52, 52),
      p('a5', 5,  'attack', 57, 52), p('a6', 6,  'attack', 28, 54),
      p('a7', 7,  'attack', 62, 54), p('a8', 8,  'attack', 50, 55),
      // Backs behind halfway
      p('a9',  9,  'attack', 42, 56),
      p('a12', 12, 'attack', 35, 60),
      p('a13', 13, 'attack', 26, 62),
      p('a11', 11, 'attack', 12, 58),
      p('a14', 14, 'attack', 72, 58),
      p('a15', 15, 'attack', 50, 70),
      // Defence receive
      p('d1', 1, 'defence', 30, 42), p('d2', 2, 'defence', 50, 38),
      p('d3', 3, 'defence', 70, 42), p('d4', 4, 'defence', 20, 30),
      p('d5', 5, 'defence', 80, 30),
    ],
  },

  // ── 22m Drop Right ─────────────────────────────────────────────────────
  {
    id: 'drop_22_right',
    name: '22m Drop Right',
    zone: 'own_22',
    group: 'Restarts',
    description: '22m restart — kicker on right',
    players: [
      // Kicker (15) at 22m line, right of centre
      p('a15', 15, 'attack', 65, 78),
      p('a1', 1,  'attack', 40, 80), p('a2', 2,  'attack', 45, 80),
      p('a3', 3,  'attack', 50, 80), p('a4', 4,  'attack', 55, 80),
      p('a5', 5,  'attack', 60, 80), p('a6', 6,  'attack', 36, 82),
      p('a7', 7,  'attack', 65, 82), p('a8', 8,  'attack', 50, 84),
      p('a9',  9,  'attack', 65, 84),
      p('a10', 10, 'attack', 42, 86),
      p('a12', 12, 'attack', 34, 88),
      p('a13', 13, 'attack', 24, 88),
      p('a11', 11, 'attack', 10, 80),
      p('a14', 14, 'attack', 82, 80),
      p('d1', 1, 'defence', 40, 68), p('d2', 2, 'defence', 50, 66),
      p('d3', 3, 'defence', 60, 68), p('d4', 4, 'defence', 30, 62),
      p('d5', 5, 'defence', 70, 62),
    ],
  },
];

export const TEMPLATE_GROUPS: Array<Template['group']> = ['Scrums', 'Lineouts', 'Restarts', 'Blank'];
