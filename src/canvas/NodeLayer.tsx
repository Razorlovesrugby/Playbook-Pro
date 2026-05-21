import { Layer, Group, Circle, Ellipse, Text } from 'react-konva';
import type { FieldZone, StepData } from '../types';
import { gridToPixel, pixelToGrid } from './coords';

interface NodeLayerProps {
  step: StepData;
  zone: FieldZone;
  width: number;
  height: number;
  isEditor?: boolean;
  onNodeClick?: (playerId: string) => void;
  onNodeDrag?: (playerId: string, x: number, y: number) => void;
}

export function NodeLayer({
  step, zone, width, height,
  isEditor = false, onNodeClick, onNodeDrag,
}: NodeLayerProps) {
  // Node radius scales with canvas width (2.4% baseline → 1.2% radius)
  const NODE_RADIUS = Math.max(10, width * 0.012);

  return (
    <Layer>
      {step.players.map(player => {
        const { px, py } = gridToPixel(player.x, player.y, zone, width, height);

        // Ball carrier (attack only) — yellow oval
        if (player.has_ball && player.team === 'attack') {
          return (
            <Group
              key={player.id}
              x={px}
              y={py}
              onClick={() => onNodeClick?.(player.id)}
              onTap={() => onNodeClick?.(player.id)}
              draggable={isEditor}
              onDragEnd={e => {
                const g = pixelToGrid(e.target.x(), e.target.y(), zone, width, height);
                onNodeDrag?.(player.id, g.gridX, g.gridY);
              }}
            >
              <Ellipse
                radiusX={NODE_RADIUS * 1.6}
                radiusY={NODE_RADIUS}
                fill="#F5C518"
                stroke="#D97706"
                strokeWidth={2}
              />
              <Text
                text={String(player.number)}
                fontSize={NODE_RADIUS * 0.9}
                fontStyle="bold"
                fill="#1a1a1a"
                align="center"
                verticalAlign="middle"
                offsetX={NODE_RADIUS * 0.8}
                offsetY={NODE_RADIUS * 0.45}
                listening={false}
              />
            </Group>
          );
        }

        // Standard attack or defence circle
        const isAttack = player.team === 'attack';
        return (
          <Group
            key={player.id}
            x={px}
            y={py}
            onClick={() => onNodeClick?.(player.id)}
            onTap={() => onNodeClick?.(player.id)}
            draggable={isEditor}
            onDragEnd={e => {
              const g = pixelToGrid(e.target.x(), e.target.y(), zone, width, height);
              onNodeDrag?.(player.id, g.gridX, g.gridY);
            }}
          >
            <Circle
              radius={NODE_RADIUS}
              fill={isAttack ? '#6B7280' : '#EF4444'}
              stroke={isAttack ? '#9CA3AF' : '#FCA5A5'}
              strokeWidth={1.5}
              hitStrokeWidth={8}
            />
            <Text
              text={String(player.number)}
              fontSize={NODE_RADIUS * 0.85}
              fontStyle="bold"
              fill="white"
              align="center"
              verticalAlign="middle"
              offsetX={NODE_RADIUS * 0.42}
              offsetY={NODE_RADIUS * 0.42}
              listening={false}
            />
          </Group>
        );
      })}
    </Layer>
  );
}
