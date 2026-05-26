import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { OptionNumber, StepData } from '../types';
import type { PlayRecord } from '../shared/types';
import { supabase } from '../shared/supabase';
import { usePlayAnimation } from '../animation';
import { ViewerCanvas } from './ViewerCanvas';
import { ModeTabs } from './ModeTabs';
import { StepControls } from './StepControls';
import { OptionCards } from './OptionCards';
import { InfoPanels } from './InfoPanels';
import { Badges } from './Badges';
import { ShareButton } from './ShareButton';
import { NotFoundPage } from './NotFoundPage';
import { Navbar, SignInModal } from '../auth';

// ─── Skeleton ──────────────────────────────────────────────────────────────

function ViewerSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 animate-pulse">
      <div className="skeleton h-4 w-32 mb-6" />
      <div className="md:grid md:grid-cols-5 md:gap-8">
        <div className="md:col-span-3 space-y-3">
          <div className="skeleton h-8 w-48" />
          <div className="skeleton w-full rounded-lg" style={{ height: 320 }} />
          <div className="skeleton h-10 w-full" />
        </div>
        <div className="md:col-span-2 mt-6 md:mt-0 space-y-3">
          <div className="skeleton h-7 w-3/4" />
          <div className="skeleton h-4 w-1/2" />
          <div className="skeleton h-10 w-full" />
          <div className="skeleton h-10 w-full" />
        </div>
      </div>
    </div>
  );
}

// ─── Use This Play button + handler ───────────────────────────────────────

interface UseThisPlayButtonProps {
  play: PlayRecord;
}

function UseThisPlayButton({ play }: UseThisPlayButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleClick = async () => {
    if (!supabase) {
      // Supabase not configured — show sign-in modal as placeholder
      setShowSignIn(true);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setShowSignIn(true);
      return;
    }

    setLoading(true);
    try {
      // Check for duplicate title
      const { data: existing } = await supabase
        .from('plays')
        .select('id')
        .eq('created_by', user.id)
        .eq('title', play.title)
        .maybeSingle();

      if (existing) {
        alert('You already have this play in My Plays.');
        return;
      }

      // Generate slug: title → kebab-case + random suffix
      const base = play.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const slug = `${base}-${Math.random().toString(36).slice(2, 8)}`;

      const { error } = await supabase.from('plays').insert({
        title: play.title,
        slug,
        difficulty: play.difficulty,
        category: play.category,
        is_library_play: false,
        created_by: user.id,
        play_data: play.play_data,
        published: false,
      });

      if (error) throw error;

      setSaved(true);
    } catch {
      alert('Could not save play. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading || saved}
        className="flex-1 px-4 py-2 bg-white text-[#0a0f1a] rounded font-medium text-sm hover:bg-white/90 disabled:opacity-60 transition-colors min-h-11"
      >
        {saved ? '✓ Saved to My Plays' : loading ? 'Saving…' : 'Use this play'}
      </button>
      <SignInModal
        isOpen={showSignIn}
        onClose={() => setShowSignIn(false)}
        returnTo={`/moves/${play.slug}`}
      />
    </>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────

type LoadState = 'loading' | 'not_found' | 'error' | 'ready';
type ViewMode  = 'overview' | 'step_by_step';

export function PlayViewerPage() {
  const { slug } = useParams<{ slug: string }>();
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [playRecord, setPlayRecord] = useState<PlayRecord | null>(null);
  const [viewMode, setViewMode]     = useState<ViewMode>('overview');
  const [hasEnded, setHasEnded]     = useState(false);

  // Load play from Supabase
  useEffect(() => {
    if (!slug) { setLoadState('not_found'); return; }

    async function load() {
      if (!supabase) {
        setLoadState('not_found');
        return;
      }
      const { data, error } = await supabase
        .from('plays')
        .select('*')
        .eq('slug', slug)
        .or('is_library_play.eq.true,published.eq.true')
        .single();

      if (error || !data) {
        setLoadState('not_found');
        return;
      }
      setPlayRecord(data as PlayRecord);
      setLoadState('ready');
    }

    void load();
  }, [slug]);

  const play = playRecord?.play_data;

  const anim = usePlayAnimation({
    play: play ?? { id: '', title: '', zone: 'full', steps: [] },
    initialStep: 0,
  });

  // When mode changes: reset animation, show all options
  const handleModeChange = (m: ViewMode) => {
    anim.reset();
    anim.setActiveOptions([1, 2, 3]);
    setHasEnded(false);
    setViewMode(m);
  };

  // Track when overview auto-play reaches the end
  const handlePlayingChange = (v: boolean) => {
    anim.setIsPlaying(v);
    if (!v && anim.currentStep >= (play?.steps.length ?? 1) - 1) {
      setHasEnded(true);
    }
  };

  const handlePlayPause = () => {
    if (hasEnded) {
      anim.reset();
      setHasEnded(false);
      // Small delay so reset renders before play starts
      setTimeout(() => anim.setIsPlaying(true), 50);
    } else {
      anim.isPlaying ? anim.pause() : anim.play();
    }
  };

  const handleStartPlay = () => {
    setHasEnded(false);
    anim.play();
  };

  const handleGoTo = (i: number) => {
    setHasEnded(false);
    anim.goToStep(i);
    if (viewMode === 'overview') anim.setIsPlaying(true);
  };

  const handleOptionToggle = (opt: OptionNumber) => {
    const next = anim.activeOptions.includes(opt)
      ? anim.activeOptions.filter(o => o !== opt)
      : [...anim.activeOptions, opt];
    if (next.length > 0) anim.setActiveOptions(next);
  };

  // ── Render states ─────────────────────────────────────────────────────────

  if (loadState === 'loading') return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <Navbar />
      <ViewerSkeleton />
    </div>
  );

  if (loadState === 'not_found' || loadState === 'error' || !play || !playRecord) {
    return <NotFoundPage />;
  }

  const currentStepData: StepData | undefined = play.steps[anim.currentStep];
  const totalSteps = play.steps.length;

  // Info block: rendered in different positions on mobile vs desktop
  const infoBlock = (
    <>
      <div className="flex gap-3 mt-4 flex-wrap">
        <UseThisPlayButton play={playRecord} />
        <ShareButton slug={playRecord.slug} title={playRecord.title} />
      </div>
      <InfoPanels info={play.info} />
    </>
  );

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <Link
          to="/moves"
          className="inline-flex items-center gap-1 text-white/40 hover:text-white/70 text-sm mb-4 transition-colors"
        >
          ← Moves
        </Link>

        {/* Title + badges — mobile only (shown above canvas) */}
        <div className="md:hidden mb-4">
          <h1 className="text-xl font-bold text-white">{playRecord.title}</h1>
          <Badges difficulty={playRecord.difficulty} category={playRecord.category} />
        </div>

        <div className="md:grid md:grid-cols-5 md:gap-8">
          {/* ── Left column: canvas + controls ─────────────────────────── */}
          <div className="md:col-span-3">
            <ModeTabs mode={viewMode} onChange={handleModeChange} />

            <ViewerCanvas
              play={play}
              zone={play.zone}
              mode={viewMode}
              speed={anim.speed}
              currentStep={anim.currentStep}
              isPlaying={anim.isPlaying}
              activeOptions={anim.activeOptions}
              onStepChange={anim.setCurrentStep}
              onPlayingChange={handlePlayingChange}
              onStartPlay={handleStartPlay}
            />

            <StepControls
              currentStep={anim.currentStep}
              totalSteps={totalSteps}
              isPlaying={anim.isPlaying}
              hasEnded={hasEnded}
              mode={viewMode}
              speed={anim.speed}
              onPrev={anim.prevStep}
              onNext={anim.nextStep}
              onGoTo={handleGoTo}
              onPlayPause={handlePlayPause}
              onReset={() => { anim.reset(); setHasEnded(false); }}
              onSpeedChange={anim.setSpeed}
            />

            {/* Step by Step: option cards + description */}
            {viewMode === 'step_by_step' && currentStepData && (
              <>
                <OptionCards
                  step={currentStepData}
                  activeOptions={anim.activeOptions}
                  onToggle={handleOptionToggle}
                />
                {currentStepData.description && (
                  <p className="mt-3 text-white/70 text-sm leading-relaxed">
                    {currentStepData.description}
                  </p>
                )}
              </>
            )}

            {/* Use/Share buttons + info — mobile only (below controls) */}
            <div className="md:hidden">{infoBlock}</div>
          </div>

          {/* ── Right column: title + info (desktop only) ──────────────── */}
          <div className="hidden md:block md:col-span-2">
            <h1 className="text-2xl font-bold text-white">{playRecord.title}</h1>
            <Badges difficulty={playRecord.difficulty} category={playRecord.category} />
            {infoBlock}
          </div>
        </div>
      </main>
    </div>
  );
}
