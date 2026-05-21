import { useRef, useState, useEffect } from 'react';
import type { FieldZone } from '../types';
import { PlaybookCanvas, type PlaybookCanvasProps } from './PlaybookCanvas';
import { ZONE_ASPECT } from './coords';

type ResponsiveCanvasProps = { zone: FieldZone } & Omit<PlaybookCanvasProps, 'width' | 'height'>;

export function ResponsiveCanvas({ zone, ...props }: ResponsiveCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 600, height: 400 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width;
      if (w == null) return;
      setDims({ width: w, height: Math.round(w * ZONE_ASPECT[zone]) });
    });

    ro.observe(el);
    // Set initial size from current width
    const w = el.clientWidth;
    if (w > 0) {
      setDims({ width: w, height: Math.round(w * ZONE_ASPECT[zone]) });
    }
    return () => ro.disconnect();
  }, [zone]);

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <PlaybookCanvas {...props} zone={zone} width={dims.width} height={dims.height} />
    </div>
  );
}
