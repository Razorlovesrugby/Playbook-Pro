import { useRef, useState, useEffect } from 'react';
import { Stage } from 'react-konva';
import type { EditorStep } from './useEditorState';
import type { FieldZone, OptionNumber } from '../types';
import { PitchLayer } from '../canvas/PitchLayer';
import { LineLayer } from '../canvas/LineLayer';
import { NodeLayer } from '../canvas/NodeLayer';
import { AnnotationLayer } from '../canvas/AnnotationLayer';
import { ZONE_ASPECT } from '../canvas/coords';

interface PreviewModalProps {
  steps: EditorStep[];
  zone: FieldZone;
  onClose: () => void;
}

const ACTIVE_OPTIONS: OptionNumber[] = [1, 2, 3];

export function PreviewModal({ steps, zone, onClose }: PreviewModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(entries => {
      const r = entries[0];
      if (!r) return;
      const w = Math.floor(r.contentRect.width);
      setSize({ width: w, height: Math.round(w * ZONE_ASPECT[zone]) });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [zone]);

  const step = steps[stepIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-[#111827] border border-white/10 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold">Preview</h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white text-xl w-8 h-8 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div ref={containerRef} className="w-full rounded-lg overflow-hidden" style={{ background: '#0a0f1a' }}>
          {size && step ? (
            <Stage width={size.width} height={size.height}>
              <PitchLayer zone={zone} width={size.width} height={size.height} />
              <LineLayer
                step={step}
                zone={zone}
                width={size.width}
                height={size.height}
                activeOptions={ACTIVE_OPTIONS}
              />
              <NodeLayer
                step={step}
                zone={zone}
                width={size.width}
                height={size.height}
                isEditor={false}
              />
              <AnnotationLayer
                step={step}
                zone={zone}
                width={size.width}
                height={size.height}
              />
            </Stage>
          ) : (
            <div className="skeleton w-full" style={{ height: 300 }} />
          )}
        </div>

        {steps.length > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setStepIndex(i => Math.max(0, i - 1))}
              disabled={stepIndex === 0}
              className="px-3 py-1.5 text-sm border border-white/20 text-white/60 hover:text-white rounded disabled:opacity-30 transition-colors min-h-9"
            >
              ← Prev
            </button>
            <span className="text-white/50 text-sm">Step {stepIndex + 1} / {steps.length}</span>
            <button
              onClick={() => setStepIndex(i => Math.min(steps.length - 1, i + 1))}
              disabled={stepIndex === steps.length - 1}
              className="px-3 py-1.5 text-sm border border-white/20 text-white/60 hover:text-white rounded disabled:opacity-30 transition-colors min-h-9"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
