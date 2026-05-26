import { Layer, Group, Rect, Text, Arrow, Circle, Line } from 'react-konva';
import type { FieldZone, StepData } from '../types';
import { gridToPixel } from './coords';

interface AnnotationLayerProps {
  step: StepData;
  zone: FieldZone;
  width: number;
  height: number;
  onAnnotationClick?: (annId: string) => void;
}

export function AnnotationLayer({ step, zone, width, height, onAnnotationClick }: AnnotationLayerProps) {
  return (
    <Layer listening={!!onAnnotationClick}>
      {step.annotations.map(ann => {
        const { px, py } = gridToPixel(ann.x, ann.y, zone, width, height);
        const clickProps = onAnnotationClick
          ? { onClick: () => onAnnotationClick(ann.id), onTap: () => onAnnotationClick(ann.id), listening: true }
          : { listening: false };

        if (ann.type === 'text' && ann.text) {
          const textWidth = ann.text.length * 7 + 16;
          return (
            <Group key={ann.id} id={ann.id} name={`annotation-${ann.id}`} x={px} y={py} {...clickProps}>
              <Rect
                x={-4}
                y={-4}
                width={textWidth}
                height={22}
                fill="rgba(0,0,0,0.65)"
                cornerRadius={4}
                listening={false}
              />
              <Text
                text={ann.text}
                fill="white"
                fontSize={12}
                listening={false}
              />
            </Group>
          );
        }

        if (ann.type === 'arrow' && ann.end_x != null && ann.end_y != null) {
          const end = gridToPixel(ann.end_x, ann.end_y, zone, width, height);
          return (
            <Arrow
              key={ann.id}
              id={ann.id}
              name={`annotation-${ann.id}`}
              points={[px, py, end.px, end.py]}
              stroke="white"
              fill="white"
              strokeWidth={2}
              pointerLength={7}
              pointerWidth={5}
              hitStrokeWidth={10}
              {...clickProps}
            />
          );
        }

        if (ann.type === 'circle') {
          return (
            <Circle
              key={ann.id}
              id={ann.id}
              name={`annotation-${ann.id}`}
              x={px}
              y={py}
              radius={16}
              stroke="white"
              strokeWidth={2}
              fill="transparent"
              {...clickProps}
            />
          );
        }

        if (ann.type === 'target') {
          return (
            <Group key={ann.id} id={ann.id} name={`annotation-${ann.id}`} x={px} y={py} {...clickProps}>
              <Circle radius={14} stroke="white" strokeWidth={1.5} fill="transparent" listening={false} />
              <Line points={[-18, 0, 18, 0]} stroke="white" strokeWidth={1} listening={false} />
              <Line points={[0, -18, 0, 18]} stroke="white" strokeWidth={1} listening={false} />
            </Group>
          );
        }

        return null;
      })}
    </Layer>
  );
}
