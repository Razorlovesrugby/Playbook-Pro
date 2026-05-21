import { Layer, Rect, Line } from 'react-konva';
import type { FieldZone } from '../types';
import { gridToPixel } from './coords';

interface PitchLayerProps {
  zone: FieldZone;
  width: number;
  height: number;
}

const MARKING_Y = [0, 5, 10, 22, 50, 78, 90, 95, 100];
const MARKING_X = [5, 15, 85, 95];

export function PitchLayer({ zone, width, height }: PitchLayerProps) {
  return (
    <Layer listening={false}>
      {/* Background */}
      <Rect width={width} height={height} fill="#0a0f1a" />

      {/* Horizontal pitch markings */}
      {MARKING_Y.map(y => {
        const { py } = gridToPixel(0, y, zone, width, height);
        if (py < 0 || py > height) return null;
        const isMainLine = y === 0 || y === 50 || y === 100;
        const isTwentyTwo = y === 22 || y === 78;
        return (
          <Line
            key={`h-${y}`}
            points={[0, py, width, py]}
            stroke="white"
            strokeWidth={isMainLine ? 1.5 : 1}
            opacity={isMainLine ? 0.45 : 0.25}
            dash={isTwentyTwo ? [6, 4] : undefined}
            listening={false}
          />
        );
      })}

      {/* Vertical channel markings */}
      {MARKING_X.map(x => {
        const { px } = gridToPixel(x, 0, zone, width, height);
        if (px < 0 || px > width) return null;
        return (
          <Line
            key={`v-${x}`}
            points={[px, 0, px, height]}
            stroke="white"
            strokeWidth={1}
            opacity={0.2}
            listening={false}
          />
        );
      })}
    </Layer>
  );
}
