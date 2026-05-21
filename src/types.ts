// ─── Field Zones ───────────────────────────────────────────────────────────

export type FieldZone =
  | 'full'
  | 'opp_22'
  | 'opp_half'
  | 'own_half'
  | 'own_22'
  | 'lineout_l'
  | 'lineout_r';

// ─── Teams ─────────────────────────────────────────────────────────────────

export type Team = 'attack' | 'defence';

// ─── Option Numbers ────────────────────────────────────────────────────────

export type OptionNumber = 1 | 2 | 3;

// ─── Line Types ────────────────────────────────────────────────────────────

export type LineType = 'run' | 'pass';

// ─── Annotation Types ──────────────────────────────────────────────────────

export type AnnotationType = 'text' | 'arrow' | 'circle' | 'target';

// ─── Player ────────────────────────────────────────────────────────────────

export interface PlayerData {
  id: string;
  number: number;
  team: Team;
  x: number;        // 0–100 grid coordinate
  y: number;        // 0–100 grid coordinate
  has_ball: boolean;
}

// ─── Line ──────────────────────────────────────────────────────────────────

export interface LineData {
  id: string;
  from_player_id: string;
  to_x: number;     // 0–100 grid coordinate
  to_y: number;     // 0–100 grid coordinate
  option: OptionNumber;
  line_type: LineType;
}

// ─── Annotation ────────────────────────────────────────────────────────────

export interface AnnotationData {
  id: string;
  type: AnnotationType;
  x: number;
  y: number;
  text?: string;
  end_x?: number;
  end_y?: number;
}

// ─── Step ──────────────────────────────────────────────────────────────────

export interface StepData {
  players: PlayerData[];
  lines: LineData[];
  annotations: AnnotationData[];
  description?: string;
}

// ─── Zone Viewport ─────────────────────────────────────────────────────────

export interface ZoneViewport {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}
