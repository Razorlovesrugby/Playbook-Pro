import { useEffect, useRef, useState } from 'react';
import { AnimatedCanvas } from '../animation';
import type { PlayData, FieldZone, OptionNumber } from '../types';
import type { SpeedKey } from '../animation';
import { ZONE_ASPECT } from '../canvas/coords';

interface ViewerCanvasProps {
  play: PlayData;
  zone: FieldZone;
  mode: 'overview' | 'step_by_step';
  speed: SpeedKey;
  currentStep: number;
  isPlaying: boolean;
  activeOptions: OptionNumber[];
  onStepChange: (n: number) => void;
  onPlayingChange: (v: boolean) => void;
  // Called when the big play overlay button is tapped
  onStartPlay: () => void;
}

export function ViewerCanvas({
  play, zone, mode, speed, currentStep, isPlaying,
  activeOptions, onStepChange, onPlayingChange, onStartPlay,
}: ViewerCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;
      const w = Math.floor(entry.contentRect.width);
      const h = Math.round(w * ZONE_ASPECT[zone]);
      setSize({ width: w, height: h });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [zone]);

  const showPlayOverlay = mode === 'overview' && !isPlaying && currentStep === 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-lg overflow-hidden"
      style={{ background: '#0a0f1a', touchAction: 'none' }}
    >
      {size && (
        <AnimatedCanvas
          play={play}
          zone={zone}
          mode={mode}
          speed={speed}
          currentStep={currentStep}
          isPlaying={isPlaying}
          activeOptions={activeOptions}
          onStepChange={onStepChange}
          onPlayingChange={onPlayingChange}
          width={size.width}
          height={size.height}
        />
      )}

      {/* Centred play overlay — shown before first play in Overview mode */}
      {showPlayOverlay && size && (
        <button
          onClick={onStartPlay}
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'rgba(10,15,26,0.45)' }}
          aria-label="Play"
        >
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
            <svg viewBox="0 0 24 24" fill="#0a0f1a" className="w-7 h-7 ml-1">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </button>
      )}

      {/* Skeleton while size is not yet measured */}
      {!size && (
        <div className="skeleton w-full" style={{ height: 300 }} />
      )}
    </div>
  );
}
