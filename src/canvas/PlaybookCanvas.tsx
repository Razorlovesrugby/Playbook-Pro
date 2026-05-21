import { Stage } from 'react-konva';
import type { FieldZone, OptionNumber, StepData } from '../types';
import { PitchLayer } from './PitchLayer';
import { LineLayer } from './LineLayer';
import { NodeLayer } from './NodeLayer';
import { AnnotationLayer } from './AnnotationLayer';

export interface PlaybookCanvasProps {
  step: StepData;
  zone: FieldZone;
  activeOptions: OptionNumber[];
  width: number;
  height: number;
  isEditor?: boolean;
  onNodeClick?: (playerId: string) => void;
  onNodeDrag?: (playerId: string, x: number, y: number) => void;
}

export function PlaybookCanvas({
  step, zone, activeOptions, width, height,
  isEditor = false, onNodeClick, onNodeDrag,
}: PlaybookCanvasProps) {
  if (width <= 0 || height <= 0) return null;

  return (
    <Stage
      width={width}
      height={height}
      style={{ borderRadius: '8px', overflow: 'hidden' }}
    >
      <PitchLayer zone={zone} width={width} height={height} />
      <LineLayer
        step={step} zone={zone}
        width={width} height={height}
        activeOptions={activeOptions}
      />
      <NodeLayer
        step={step} zone={zone}
        width={width} height={height}
        isEditor={isEditor}
        onNodeClick={onNodeClick}
        onNodeDrag={onNodeDrag}
      />
      <AnnotationLayer step={step} zone={zone} width={width} height={height} />
    </Stage>
  );
}
