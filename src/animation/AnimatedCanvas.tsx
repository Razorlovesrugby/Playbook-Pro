import { useCallback, useEffect, useRef, useState } from 'react';
import Konva from 'konva';
import { Stage, Layer, Group, Circle, Ellipse, Text, Arrow } from 'react-konva';
import type { PlayData, FieldZone, OptionNumber } from '../types';
import type { SpeedKey } from './config';
import { ANIMATION_CONFIG } from './config';
import { PitchLayer } from '../canvas/PitchLayer';
import { AnnotationLayer } from '../canvas/AnnotationLayer';
import { gridToPixel, OPTION_COLOURS } from '../canvas/coords';

export interface AnimatedCanvasProps {
  play: PlayData;
  zone: FieldZone;
  mode: 'overview' | 'step_by_step';
  speed: SpeedKey;
  currentStep: number;
  isPlaying: boolean;
  activeOptions: OptionNumber[];
  onStepChange: (newStep: number) => void;
  onPlayingChange: (isPlaying: boolean) => void;
  width: number;
  height: number;
}

interface CancelRef { value: boolean }

export function AnimatedCanvas({
  play, zone, mode, speed, currentStep, isPlaying,
  activeOptions, onStepChange, onPlayingChange, width, height,
}: AnimatedCanvasProps) {
  // renderStep drives which step data React renders. It lags behind currentStep
  // during animation so React doesn't reset Konva node positions mid-tween.
  const [renderStep, setRenderStep] = useState(currentStep);
  const renderStepRef = useRef(renderStep);

  // Stable refs for values read inside animation callbacks (avoids stale closures)
  const speedRef       = useRef(speed);
  const zoneRef        = useRef(zone);
  const widthRef       = useRef(width);
  const heightRef      = useRef(height);
  const playRef        = useRef(play);
  const activeOptRef   = useRef(activeOptions);

  speedRef.current     = speed;
  zoneRef.current      = zone;
  widthRef.current     = width;
  heightRef.current    = height;
  playRef.current      = play;
  activeOptRef.current = activeOptions;

  // Konva node refs — keyed by player/line id
  const playerGroupRefs = useRef<Map<string, Konva.Group>>(new Map());
  const lineArrowRefs   = useRef<Map<string, Konva.Arrow>>(new Map());
  const activeTweensRef = useRef<Konva.Tween[]>([]);

  // Mid-animation ball carrier (updated at BALL_TRANSFER_FRACTION)
  const [ballCarrierId, setBallCarrierId] = useState<string | null>(
    () => play.steps[0]?.players.find(p => p.has_ball && p.team === 'attack')?.id ?? null,
  );

  // Sync ball carrier when renderStep settles
  useEffect(() => {
    const stepData = playRef.current.steps[renderStep];
    const carrier = stepData?.players.find(p => p.has_ball && p.team === 'attack');
    setBallCarrierId(carrier?.id ?? null);
  }, [renderStep]);

  // Pause when tab is hidden
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && isPlaying) onPlayingChange(false);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isPlaying, onPlayingChange]);

  const killTweens = useCallback(() => {
    for (const t of activeTweensRef.current) {
      try { t.finish(); t.destroy(); } catch { /* node may be unmounted */ }
    }
    activeTweensRef.current = [];
  }, []);

  // Core animation function — reads all mutable values from refs so it is
  // stable (empty useCallback deps) and never captures stale data.
  const animateForward = useCallback((
    fromStep: number,
    toStep: number,
    onComplete: () => void,
    cancelled: CancelRef,
  ) => {
    killTweens();

    const p    = playRef.current;
    const spd  = speedRef.current;
    const z    = zoneRef.current;
    const w    = widthRef.current;
    const h    = heightRef.current;
    const opts = activeOptRef.current;

    const step     = p.steps[fromStep];
    const nextStep = p.steps[toStep];
    if (!step || !nextStep) { onComplete(); return; }

    const durationSec =
      ANIMATION_CONFIG.BASE_STEP_DURATION_MS / ANIMATION_CONFIG.SPEEDS[spd] / 1000;

    const newTweens: Konva.Tween[] = [];

    // ── Player tweens ──────────────────────────────────────────────────────

    const movingIds: string[] = [];
    for (const player of step.players) {
      const dest = nextStep.players.find(np => np.id === player.id) ?? player;
      const stationary = Math.abs(dest.x - player.x) < 0.01 && Math.abs(dest.y - player.y) < 0.01;
      if (!stationary) movingIds.push(player.id);
    }

    let completedCount = 0;
    const totalMoving = movingIds.length;

    const checkAllDone = () => {
      completedCount++;
      if (completedCount >= Math.max(1, totalMoving) && !cancelled.value) {
        onComplete();
      }
    };

    if (totalMoving === 0) {
      // No players to animate — fire after duration so timing still feels right
      const tid = window.setTimeout(() => {
        if (!cancelled.value) onComplete();
      }, durationSec * 1000);
      // Store as a sentinel tween-like object for killTweens to ignore; cancel via flag
      void tid;
    }

    for (const player of step.players) {
      const dest = nextStep.players.find(np => np.id === player.id) ?? player;
      const stationary = Math.abs(dest.x - player.x) < 0.01 && Math.abs(dest.y - player.y) < 0.01;
      if (stationary) continue;

      const node = playerGroupRefs.current.get(player.id);
      if (!node) { checkAllDone(); continue; }

      const { px: toPx, py: toPy } = gridToPixel(dest.x, dest.y, z, w, h);

      const tween = new Konva.Tween({
        node,
        x: toPx,
        y: toPy,
        duration: durationSec,
        easing: Konva.Easings.EaseInOut,
        onFinish: checkAllDone,
      });
      tween.play();
      newTweens.push(tween);
    }

    // ── Line draw animations ───────────────────────────────────────────────

    for (const line of step.lines) {
      if (!(opts as number[]).includes(line.option)) continue;

      const arrowNode = lineArrowRefs.current.get(line.id);
      if (!arrowNode) continue;

      const fromPlayer = step.players.find(p => p.id === line.from_player_id);
      if (!fromPlayer) continue;

      const from = gridToPixel(fromPlayer.x, fromPlayer.y, z, w, h);
      const to   = gridToPixel(line.to_x, line.to_y, z, w, h);
      const lineLen = Math.hypot(to.px - from.px, to.py - from.py);

      if (line.line_type === 'run') {
        // Hide line, then draw it in
        arrowNode.dash([lineLen * 2, lineLen * 2]);
        arrowNode.dashOffset(lineLen * 2);
        const t = new Konva.Tween({
          node: arrowNode,
          dashOffset: 0,
          duration: durationSec * ANIMATION_CONFIG.LINE_DRAW_FRACTION,
          easing: Konva.Easings.EaseOut,
        });
        t.play();
        newTweens.push(t);
      } else {
        // Pass line — marching ants effect
        arrowNode.dashOffset(13);
        const t = new Konva.Tween({
          node: arrowNode,
          dashOffset: 0,
          duration: durationSec,
          easing: Konva.Easings.Linear,
        });
        t.play();
        newTweens.push(t);
      }
    }

    activeTweensRef.current = newTweens;

    // ── Ball transfer at 50% through animation ─────────────────────────────

    const passLine = step.lines.find(l => l.line_type === 'pass' && l.option === 1);
    if (passLine) {
      window.setTimeout(() => {
        if (cancelled.value) return;
        // Receiver is whoever has_ball in the next step
        const receiver = nextStep.players.find(
          p => p.has_ball && p.team === 'attack',
        );
        if (receiver) setBallCarrierId(receiver.id);
      }, durationSec * ANIMATION_CONFIG.BALL_TRANSFER_FRACTION * 1000);
    }
  }, [killTweens]);

  // ── Overview: auto-play loop ───────────────────────────────────────────────

  useEffect(() => {
    if (!isPlaying || mode !== 'overview') return;

    const cancelled: CancelRef = { value: false };

    function runLoop(fromStep: number) {
      if (cancelled.value) return;
      if (fromStep >= playRef.current.steps.length - 1) {
        onPlayingChange(false);
        return;
      }

      animateForward(fromStep, fromStep + 1, () => {
        if (cancelled.value) return;
        const next = fromStep + 1;
        renderStepRef.current = next;
        setRenderStep(next);
        onStepChange(next);

        window.setTimeout(() => {
          if (!cancelled.value) runLoop(next);
        }, ANIMATION_CONFIG.INTER_STEP_PAUSE_MS);
      }, cancelled);
    }

    runLoop(renderStepRef.current);

    return () => {
      cancelled.value = true;
      killTweens();
    };
    // speed in deps: changing speed mid-play kills and restarts at new speed
  }, [isPlaying, mode, speed, animateForward, killTweens, onPlayingChange, onStepChange]);

  // ── Step-by-step: respond to parent's currentStep changes ─────────────────

  useEffect(() => {
    if (mode !== 'step_by_step') return;
    const rs = renderStepRef.current;
    if (currentStep === rs) return;

    if (currentStep > rs) {
      const cancelled: CancelRef = { value: false };
      animateForward(rs, currentStep, () => {
        if (cancelled.value) return;
        renderStepRef.current = currentStep;
        setRenderStep(currentStep);
      }, cancelled);
      return () => {
        cancelled.value = true;
        killTweens();
      };
    } else {
      // Previous — snap instantly, no animation
      killTweens();
      renderStepRef.current = currentStep;
      setRenderStep(currentStep);
    }
  }, [currentStep, mode, animateForward, killTweens]);

  // Cleanup on unmount
  useEffect(() => () => killTweens(), [killTweens]);

  if (width <= 0 || height <= 0) return null;

  const step = play.steps[renderStep];
  if (!step) return null;

  const NODE_RADIUS = Math.max(10, width * 0.012);

  return (
    <Stage
      width={width}
      height={height}
      style={{ borderRadius: '8px', overflow: 'hidden' }}
    >
      <PitchLayer zone={zone} width={width} height={height} />

      {/* Animated line layer */}
      <Layer listening={false}>
        {step.lines
          .filter(l => (activeOptions as number[]).includes(l.option))
          .map(line => {
            const fromPlayer = step.players.find(p => p.id === line.from_player_id);
            if (!fromPlayer) return null;
            const from   = gridToPixel(fromPlayer.x, fromPlayer.y, zone, width, height);
            const to     = gridToPixel(line.to_x, line.to_y, zone, width, height);
            const colour = OPTION_COLOURS[line.option] ?? '#F5C518';
            return (
              <Arrow
                key={line.id}
                id={line.id}
                name={`line-${line.id}`}
                ref={(node: Konva.Arrow | null) => {
                  if (node) lineArrowRefs.current.set(line.id, node);
                  else lineArrowRefs.current.delete(line.id);
                }}
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

      {/* Animated node layer */}
      <Layer>
        {step.players.map(player => {
          const { px, py } = gridToPixel(player.x, player.y, zone, width, height);
          const isBallCarrier = player.id === ballCarrierId && player.team === 'attack';
          const isAttack = player.team === 'attack';

          return (
            <Group
              key={player.id}
              id={player.id}
              name={`player-${player.id}`}
              x={px}
              y={py}
              ref={(node: Konva.Group | null) => {
                if (node) playerGroupRefs.current.set(player.id, node);
                else playerGroupRefs.current.delete(player.id);
              }}
            >
              {isBallCarrier ? (
                <>
                  <Ellipse
                    name="shape"
                    radiusX={NODE_RADIUS * 1.6}
                    radiusY={NODE_RADIUS}
                    fill="#F5C518"
                    stroke="#D97706"
                    strokeWidth={2}
                    listening={false}
                  />
                  <Text
                    name="label"
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
                </>
              ) : (
                <>
                  <Circle
                    name="shape"
                    radius={NODE_RADIUS}
                    fill={isAttack ? '#6B7280' : '#EF4444'}
                    stroke={isAttack ? '#9CA3AF' : '#FCA5A5'}
                    strokeWidth={1.5}
                    hitStrokeWidth={8}
                    listening={false}
                  />
                  <Text
                    name="label"
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
                </>
              )}
            </Group>
          );
        })}
      </Layer>

      <AnnotationLayer step={step} zone={zone} width={width} height={height} />
    </Stage>
  );
}
