import { Component, type ReactNode } from 'react';
import { ResponsiveCanvas } from '../canvas';
import type { PlayRecord } from '../shared/types';

class ThumbnailErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return <div className="w-full h-full bg-[#0a0f1a]" />;
    return this.props.children;
  }
}

export function PlayThumbnail({ play }: { play: PlayRecord }) {
  const step = play.play_data?.steps?.[0];
  if (!step) return <div className="w-full h-full bg-[#0a0f1a]" />;

  return (
    <ThumbnailErrorBoundary>
      <div className="w-full h-full">
        <ResponsiveCanvas
          step={step}
          zone={play.play_data.zone ?? 'full'}
          activeOptions={[1, 2, 3]}
        />
      </div>
    </ThumbnailErrorBoundary>
  );
}
