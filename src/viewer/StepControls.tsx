import { SpeedControl } from '../animation';
import type { SpeedKey } from '../animation';

interface StepControlsProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  hasEnded: boolean;
  mode: 'overview' | 'step_by_step';
  speed: SpeedKey;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (i: number) => void;
  onPlayPause: () => void;
  onReset: () => void;
  onSpeedChange: (s: SpeedKey) => void;
}

export function StepControls({
  currentStep, totalSteps, isPlaying, hasEnded, mode,
  speed, onPrev, onNext, onGoTo, onPlayPause, onReset, onSpeedChange,
}: StepControlsProps) {
  const atStart = currentStep === 0;
  const atEnd   = currentStep === totalSteps - 1;

  const playLabel = hasEnded ? 'Replay' : isPlaying ? 'Pause' : 'Play';

  return (
    <div className="space-y-2 mt-3">
      {/* Step dot navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          disabled={atStart}
          className="p-2 text-white/70 hover:text-white disabled:opacity-30 min-w-11 min-h-11 flex items-center justify-center"
          aria-label="Previous step"
        >
          ◀
        </button>

        <div className="flex gap-1">
          {Array.from({ length: totalSteps }, (_, i) => (
            <button
              key={i}
              onClick={() => onGoTo(i)}
              className={`w-8 h-8 rounded text-sm font-mono transition-colors
                ${i === currentStep
                  ? 'bg-white text-[#0a0f1a] font-bold'
                  : 'text-white/50 border border-white/20 hover:border-white/60'
                }`}
              aria-label={`Go to step ${i + 1}`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button
          onClick={onNext}
          disabled={atEnd}
          className="p-2 text-white/70 hover:text-white disabled:opacity-30 min-w-11 min-h-11 flex items-center justify-center"
          aria-label="Next step"
        >
          ▶
        </button>
      </div>

      {/* Playback + speed row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {mode === 'overview' && (
            <button
              onClick={onPlayPause}
              className="px-4 py-1.5 bg-white text-[#0a0f1a] rounded font-medium text-sm hover:bg-white/90 min-h-11"
            >
              {playLabel}
            </button>
          )}
          <button
            onClick={onReset}
            className="px-3 py-1.5 border border-white/20 text-white/60 rounded text-sm hover:text-white min-h-11"
          >
            Reset
          </button>
        </div>

        <div className="flex items-center gap-3">
          <SpeedControl value={speed} onChange={onSpeedChange} />
          <span className="text-white/40 text-xs font-mono">
            Step {currentStep + 1} / {totalSteps}
          </span>
        </div>
      </div>
    </div>
  );
}
