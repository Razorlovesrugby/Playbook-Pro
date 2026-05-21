import type { FieldZone, ZoneViewport } from '../types';

// ─── Zone Viewports ────────────────────────────────────────────────────────
// Maps each field zone to the 0–100 grid region it displays.

export const ZONE_VIEWPORTS: Record<FieldZone, ZoneViewport> = {
  full:       { xMin: 0,  xMax: 100, yMin: 0,  yMax: 100 },
  opp_22:     { xMin: 0,  xMax: 100, yMin: 0,  yMax: 30  },
  opp_half:   { xMin: 0,  xMax: 100, yMin: 0,  yMax: 55  },
  own_half:   { xMin: 0,  xMax: 100, yMin: 45, yMax: 100 },
  own_22:     { xMin: 0,  xMax: 100, yMin: 70, yMax: 100 },
  lineout_l:  { xMin: 0,  xMax: 55,  yMin: 0,  yMax: 40  },
  lineout_r:  { xMin: 45, xMax: 100, yMin: 0,  yMax: 40  },
};

// ─── Zone Aspect Ratios (height / width) ───────────────────────────────────

export const ZONE_ASPECT: Record<FieldZone, number> = {
  full:       0.67,
  opp_22:     0.625,
  opp_half:   0.72,
  own_half:   0.72,
  own_22:     0.625,
  lineout_l:  0.71,
  lineout_r:  0.71,
};

// ─── Option Colours ────────────────────────────────────────────────────────

export const OPTION_COLOURS: Record<number, string> = {
  1: '#F5C518',  // Yellow — default plan
  2: '#4A90D9',  // Blue — alternative
  3: '#FF8C00',  // Orange — third read
};

// ─── Coordinate Conversions ────────────────────────────────────────────────
// 0–100 grid coordinates ↔ pixel positions for a given zone + canvas size.

export function gridToPixel(
  gridX: number,
  gridY: number,
  zone: FieldZone,
  canvasWidth: number,
  canvasHeight: number,
): { px: number; py: number } {
  const vp = ZONE_VIEWPORTS[zone];
  const scaleX = canvasWidth  / (vp.xMax - vp.xMin);
  const scaleY = canvasHeight / (vp.yMax - vp.yMin);
  return {
    px: (gridX - vp.xMin) * scaleX,
    py: (gridY - vp.yMin) * scaleY,
  };
}

export function pixelToGrid(
  px: number,
  py: number,
  zone: FieldZone,
  canvasWidth: number,
  canvasHeight: number,
): { gridX: number; gridY: number } {
  const vp = ZONE_VIEWPORTS[zone];
  const scaleX = canvasWidth  / (vp.xMax - vp.xMin);
  const scaleY = canvasHeight / (vp.yMax - vp.yMin);
  return {
    gridX: (px / scaleX) + vp.xMin,
    gridY: (py / scaleY) + vp.yMin,
  };
}

// ─── Clamp ─────────────────────────────────────────────────────────────────

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
