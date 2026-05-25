import { useRef, useState } from 'react';
import Konva from 'konva';
import { Stage, Layer, Arrow, Circle } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { FieldZone, OptionNumber, AnnotationData } from '../types';
import type { EditorStep, EditorTool } from './useEditorState';
import { PitchLayer } from '../canvas/PitchLayer';
import { LineLayer } from '../canvas/LineLayer';
import { NodeLayer } from '../canvas/NodeLayer';
import { AnnotationLayer } from '../canvas/AnnotationLayer';
import { gridToPixel, pixelToGrid, OPTION_COLOURS, ZONE_ASPECT } from '../canvas/coords';
import { useEffect } from 'react';

interface DrawState {
  type: 'run' | 'arrow';
  fromPlayerId?: string;
  startGridX: number;
  startGridY: number;
}

interface PreviewLine {
  x1: number; y1: number;
  x2: number; y2: number;
  colour: string;
  dashed: boolean;
}

interface EditorCanvasProps {
  step: EditorStep;
  zone: FieldZone;
  activeTool: EditorTool;
  activeOption: OptionNumber;
  selectedPlayerId: string | null;
  passFromId: string | null;
  width: number;
  height: number;
  onPlayerClick: (id: string) => void;
  onPlayerDrag: (id: string, x: number, y: number) => void;
  onLineClick: (id: string) => void;
  onAnnotationClick: (id: string) => void;
  onDrawLine: (fromId: string, toX: number, toY: number, type: 'run' | 'pass', option: OptionNumber) => void;
  onDrawAnnotation: (ann: Omit<AnnotationData, 'id'>) => void;
  onPassPlayerClick: (id: string) => void;
  onCanvasClick: () => void;       // deselect / cancel
  onTextPlace: (gridX: number, gridY: number) => void;
}

export function EditorCanvas({
  step, zone, activeTool, activeOption, selectedPlayerId, passFromId,
  width, height,
  onPlayerClick, onPlayerDrag, onLineClick, onAnnotationClick,
  onDrawLine, onDrawAnnotation, onPassPlayerClick, onCanvasClick, onTextPlace,
}: EditorCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const drawStateRef = useRef<DrawState | null>(null);
  const activeToolRef = useRef(activeTool);
  const activeOptionRef = useRef(activeOption);
  const passFromIdRef = useRef(passFromId);

  activeToolRef.current = activeTool;
  activeOptionRef.current = activeOption;
  passFromIdRef.current = passFromId;

  const [preview, setPreview] = useState<PreviewLine | null>(null);

  // Reset preview when tool changes
  useEffect(() => {
    setPreview(null);
    drawStateRef.current = null;
  }, [activeTool]);

  const getPointerGrid = () => {
    const pos = stageRef.current?.getPointerPosition();
    if (!pos) return null;
    return pixelToGrid(pos.x, pos.y, zone, width, height);
  };

  const getPlayerGroupFromTarget = (target: Konva.Node) => {
    if (target.name().startsWith('player-')) return target;
    const parent = target.getParent();
    if (parent?.name().startsWith('player-')) return parent;
    return null;
  };

  const handleMouseDown = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const tool = activeToolRef.current;
    const group = getPlayerGroupFromTarget(e.target);
    const grid = getPointerGrid();
    if (!grid) return;

    if (tool === 'run' && group) {
      drawStateRef.current = {
        type: 'run',
        fromPlayerId: group.id(),
        startGridX: grid.gridX,
        startGridY: grid.gridY,
      };
    }

    if (tool === 'arrow' && !group) {
      drawStateRef.current = {
        type: 'arrow',
        startGridX: grid.gridX,
        startGridY: grid.gridY,
      };
    }
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const ds = drawStateRef.current;
    if (!ds) return;
    const grid = getPointerGrid();
    if (!grid) return;

    const fromPx = gridToPixel(ds.startGridX, ds.startGridY, zone, width, height);
    const colour = OPTION_COLOURS[activeOptionRef.current] ?? '#F5C518';

    setPreview({
      x1: fromPx.px, y1: fromPx.py,
      x2: grid.gridX * (width / 100),
      y2: grid.gridY * (height / 100),
      colour,
      dashed: ds.type === 'arrow',
    });

    // Suppress unused event warning
    void e;
  };

  const handleMouseUp = () => {
    const ds = drawStateRef.current;
    drawStateRef.current = null;
    setPreview(null);
    if (!ds) return;

    const grid = getPointerGrid();
    if (!grid) return;

    const dist = Math.hypot(grid.gridX - ds.startGridX, grid.gridY - ds.startGridY);
    if (dist < 3) return; // too short

    if (ds.type === 'run' && ds.fromPlayerId) {
      onDrawLine(ds.fromPlayerId, grid.gridX, grid.gridY, 'run', activeOptionRef.current);
    }

    if (ds.type === 'arrow') {
      onDrawAnnotation({
        type: 'arrow',
        x: ds.startGridX, y: ds.startGridY,
        end_x: grid.gridX, end_y: grid.gridY,
      });
    }
  };

  const handleClick = (e: KonvaEventObject<MouseEvent>) => {
    // Skip if this was the end of a drag
    if (drawStateRef.current) return;

    const tool = activeToolRef.current;
    const group = getPlayerGroupFromTarget(e.target);
    const grid = getPointerGrid();
    if (!grid) return;

    if (tool === 'select') {
      if (group) onPlayerClick(group.id());
      else onCanvasClick();
      return;
    }

    if (tool === 'pass') {
      if (group) {
        onPassPlayerClick(group.id());
      } else {
        onCanvasClick(); // cancel pass
      }
      return;
    }

    if (tool === 'circle' && !group) {
      onDrawAnnotation({ type: 'circle', x: grid.gridX, y: grid.gridY });
      return;
    }

    if (tool === 'target' && !group) {
      onDrawAnnotation({ type: 'target', x: grid.gridX, y: grid.gridY });
      return;
    }

    if (tool === 'text' && !group) {
      onTextPlace(grid.gridX, grid.gridY);
      return;
    }

    if (tool === 'eraser') {
      if (group) onPlayerClick(group.id()); // show confirm in parent
    }
  };

  // Cursor style per tool
  const cursorMap: Record<EditorTool, string> = {
    select: 'default', run: 'crosshair', pass: 'crosshair',
    arrow: 'crosshair', circle: 'crosshair', text: 'text',
    target: 'crosshair', eraser: 'not-allowed',
  };

  const passFrom = passFromId
    ? step.players.find(p => p.id === passFromId)
    : null;

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      style={{ cursor: cursorMap[activeTool], borderRadius: 8, overflow: 'hidden' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      onTouchStart={handleMouseDown}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
    >
      <PitchLayer zone={zone} width={width} height={height} />

      <LineLayer
        step={step} zone={zone} width={width} height={height}
        activeOptions={[1, 2, 3] as OptionNumber[]}
        onLineClick={activeTool === 'eraser' ? onLineClick : undefined}
      />

      <NodeLayer
        step={step} zone={zone} width={width} height={height}
        isEditor
        isDraggable={activeTool === 'select'}
        selectedPlayerId={selectedPlayerId}
        onNodeClick={onPlayerClick}
        onNodeDrag={onPlayerDrag}
      />

      <AnnotationLayer
        step={step} zone={zone} width={width} height={height}
        onAnnotationClick={activeTool === 'eraser' ? onAnnotationClick : undefined}
      />

      {/* Overlay: draw preview + pass preview */}
      <Layer listening={false}>
        {preview && (
          <Arrow
            points={[preview.x1, preview.y1, preview.x2, preview.y2]}
            stroke={preview.colour}
            fill={preview.colour}
            strokeWidth={2}
            dash={preview.dashed ? [6, 4] : undefined}
            opacity={0.7}
            pointerLength={7}
            pointerWidth={5}
          />
        )}

        {/* Pass tool: line from passer to cursor */}
        {activeTool === 'pass' && passFrom && (() => {
          const from = gridToPixel(passFrom.x, passFrom.y, zone, width, height);
          const colour = OPTION_COLOURS[activeOption] ?? '#F5C518';
          // Get live cursor position from stage
          const pos = stageRef.current?.getPointerPosition();
          if (!pos) return null;
          return (
            <Arrow
              points={[from.px, from.py, pos.x, pos.y]}
              stroke={colour}
              fill={colour}
              strokeWidth={2}
              dash={[8, 5]}
              opacity={0.6}
              pointerLength={7}
              pointerWidth={5}
            />
          );
        })()}

        {/* Selection indicator for pass tool passer */}
        {activeTool === 'pass' && passFrom && (() => {
          const { px, py } = gridToPixel(passFrom.x, passFrom.y, zone, width, height);
          const r = Math.max(10, width * 0.012) * 1.8;
          return <Circle x={px} y={py} radius={r} stroke="#4A90D9" strokeWidth={2} dash={[4, 3]} fill="transparent" />;
        })()}
      </Layer>
    </Stage>
  );
}

// ─── Responsive wrapper ─────────────────────────────────────────────────────

interface ResponsiveEditorCanvasProps extends Omit<EditorCanvasProps, 'width' | 'height'> {}

export function ResponsiveEditorCanvas(props: ResponsiveEditorCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;
      const w = Math.floor(entry.contentRect.width);
      const h = Math.round(w * ZONE_ASPECT[props.zone]);
      setSize({ width: w, height: h });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [props.zone]);

  return (
    <div
      ref={containerRef}
      className="w-full"
      style={{ background: '#0a0f1a', borderRadius: 8, touchAction: 'none' }}
    >
      {size ? (
        <EditorCanvas {...props} width={size.width} height={size.height} />
      ) : (
        <div className="skeleton w-full" style={{ height: 320 }} />
      )}
    </div>
  );
}
