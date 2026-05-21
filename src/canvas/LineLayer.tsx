import { Layer, Arrow } from 'react-konva';
import type { FieldZone, OptionNumber, StepData } from '../types';
import { gridToPixel, OPTION_COLOURS } from './coords';

interface LineLayerProps {
  step: StepData;
  zone: FieldZone;
  width: number;
  height: number;
  activeOptions: OptionNumber[];
}

export function LineLayer({ step, zone, width, height, activeOptions }: LineLayerProps) {
  const visibleLines = step.lines.filter(l =>
    activeOptions.includes(l.option as OptionNumber)
  );

  return (
    <Layer listening={false}>
      {visibleLines.map(line => {
        const fromPlayer = step.players.find(p => p.id === line.from_player_id);
        if (!fromPlayer) return null;

        const from = gridToPixel(fromPlayer.x, fromPlayer.y, zone, width, height);
        const to   = gridToPixel(line.to_x, line.to_y, zone, width, height);
        const colour = OPTION_COLOURS[line.option] ?? '#F5C518';

        return (
          <Arrow
            key={line.id}
            points={[from.px, from.py, to.px, to.py]}
            stroke={colour}
            strokeWidth={2.5}
            fill={colour}
            dash={line.line_type === 'pass' ? [8, 5] : undefined}
            pointerLength={8}
            pointerWidth={6}
            lineCap="round"
            listening={false}
          />
        );
      })}
    </Layer>
  );
}
