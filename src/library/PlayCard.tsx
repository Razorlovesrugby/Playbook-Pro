import { useNavigate } from 'react-router-dom';
import { Badges } from '../viewer/Badges';
import { PlayThumbnail } from './PlayThumbnail';
import type { PlayRecord } from '../shared/types';

interface PlayCardProps {
  play: PlayRecord;
}

export function PlayCard({ play }: PlayCardProps) {
  const navigate = useNavigate();
  const stepCount = play.play_data?.steps?.length ?? 0;

  return (
    <button
      onClick={() => navigate(`/moves/${play.slug}`)}
      className="group text-left rounded-lg border border-white/10 overflow-hidden hover:border-white/30 transition-all bg-white/5 hover:bg-white/8 w-full"
    >
      <div className="aspect-video bg-[#0a0f1a] relative overflow-hidden">
        <PlayThumbnail play={play} />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white font-medium text-sm">▶ Watch</span>
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-white font-semibold text-sm leading-tight mb-2 line-clamp-2">
          {play.title}
        </h3>
        <Badges difficulty={play.difficulty} category={play.category} />
        {stepCount > 0 && (
          <p className="text-white/30 text-xs mt-2">{stepCount} steps</p>
        )}
      </div>
    </button>
  );
}
