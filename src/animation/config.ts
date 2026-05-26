export const ANIMATION_CONFIG = {
  // Duration of one step's animation in milliseconds (at 1x speed)
  BASE_STEP_DURATION_MS: 1800,

  // Speed multipliers — actual duration = BASE / multiplier
  SPEEDS: {
    '0.5x': 0.5,
    '1x':   1.0,
    '2x':   2.0,
  } as const,

  INTER_STEP_PAUSE_MS: 400,

  // Lines finish drawing at this fraction of the step duration
  LINE_DRAW_FRACTION: 0.7,

  // Ball transfers to receiver at this fraction of the step duration
  BALL_TRANSFER_FRACTION: 0.5,
} as const;

export type SpeedKey = keyof typeof ANIMATION_CONFIG.SPEEDS;
