import { useCallback, useEffect, useRef, useState } from 'react';
import type { StepData, PlayerData, LineData, AnnotationData, FieldZone, OptionNumber, PlayInfo } from '../types';
import type { Difficulty } from '../shared/types';
import { supabase } from '../shared/supabase';

// ─── Types ─────────────────────────────────────────────────────────────────

export type EditorTool = 'select' | 'run' | 'pass' | 'arrow' | 'circle' | 'text' | 'target' | 'eraser';

export interface EditorStep extends StepData {
  step_id: string;
}

export interface EditorState {
  steps: EditorStep[];
  activeStepIndex: number;
  activeTool: EditorTool;
  activeOption: OptionNumber;
  activeZone: FieldZone;
  playTitle: string;
  playDifficulty: Difficulty;
  playCategory: string;
  playInfo: PlayInfo;
  passFromId: string | null;
  selectedPlayerId: string | null;
  isDirty: boolean;
  isSaving: boolean;
  playId: string | null;
  savedSlug: string | null;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function makeStepId() {
  return `step_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function emptyStep(): EditorStep {
  return { step_id: makeStepId(), players: [], lines: [], annotations: [] };
}

function carryForward(from: EditorStep): EditorStep {
  const newPlayers: PlayerData[] = from.players.map(player => {
    const opt1Line = from.lines.find(l => l.from_player_id === player.id && l.option === 1);
    return opt1Line
      ? { ...player, x: opt1Line.to_x, y: opt1Line.to_y, has_ball: false }
      : { ...player, has_ball: false };
  });

  // Auto-assign ball to receiver of last Option 1 pass
  const lastPass = [...from.lines]
    .filter(l => l.line_type === 'pass' && l.option === 1 && l.to_player_id)
    .pop();
  if (lastPass?.to_player_id) {
    const idx = newPlayers.findIndex(p => p.id === lastPass.to_player_id);
    if (idx >= 0) {
      const existing = newPlayers[idx];
      if (existing) newPlayers[idx] = { ...existing, has_ball: true };
    }
  }

  return { step_id: makeStepId(), players: newPlayers, lines: [], annotations: [] };
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useEditorState(initialPlayId: string | null) {
  const [steps, setSteps] = useState<EditorStep[]>([emptyStep()]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [activeTool, setActiveTool] = useState<EditorTool>('select');
  const [activeOption, setActiveOption] = useState<OptionNumber>(1);
  const [activeZone, setActiveZone] = useState<FieldZone>('full');
  const [playTitle, setPlayTitle] = useState('');
  const [playDifficulty, setPlayDifficulty] = useState<Difficulty>('beginner');
  const [playCategory, setPlayCategory] = useState('Attack Structure');
  const [playInfo, setPlayInfo] = useState<PlayInfo>({});
  const [passFromId, setPassFromId] = useState<string | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [playId, setPlayId] = useState<string | null>(initialPlayId);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);

  const isDirtyRef = useRef(isDirty);
  isDirtyRef.current = isDirty;

  // ── Load existing play ──────────────────────────────────────────────────
  useEffect(() => {
    if (!initialPlayId || !supabase) return;
    supabase.from('plays').select('*').eq('id', initialPlayId).single().then(({ data }) => {
      if (!data) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pd = data.play_data as any;
      setPlayTitle(data.title ?? '');
      setPlayDifficulty(data.difficulty ?? 'beginner');
      setPlayCategory(data.category ?? 'Attack Structure');
      setPlayInfo(pd?.info ?? {});
      setActiveZone(pd?.zone ?? 'full');
      setSavedSlug(data.slug ?? null);
      if (pd?.steps && Array.isArray(pd.steps)) {
        setSteps((pd.steps as StepData[]).map((s, i) => ({
          ...s,
          step_id: (s as EditorStep).step_id ?? `step_${i}`,
        })));
      }
      setIsDirty(false);
    });
  }, [initialPlayId]);

  // ── Mark dirty on any mutation ──────────────────────────────────────────
  const markDirty = useCallback(() => setIsDirty(true), []);

  // ── Active step ─────────────────────────────────────────────────────────
  const activeStep: EditorStep = steps[activeStepIndex] ?? emptyStep();

  // ── Step mutations ──────────────────────────────────────────────────────
  const updateStep = useCallback((index: number, updater: (s: EditorStep) => EditorStep) => {
    setSteps(prev => prev.map((s, i) => i === index ? updater(s) : s));
    markDirty();
  }, [markDirty]);

  const addStep = useCallback(() => {
    setSteps(prev => {
      const current = prev[prev.length - 1] ?? emptyStep();
      return [...prev, carryForward(current)];
    });
    setActiveStepIndex(prev => prev + 1);
    setSelectedPlayerId(null);
    markDirty();
  }, [markDirty]);

  const insertStep = useCallback((beforeIndex: number) => {
    setSteps(prev => {
      const from = prev[beforeIndex - 1] ?? emptyStep();
      const newStep = carryForward(from);
      return [...prev.slice(0, beforeIndex), newStep, ...prev.slice(beforeIndex)];
    });
    setActiveStepIndex(beforeIndex);
    markDirty();
  }, [markDirty]);

  const deleteStep = useCallback((index: number) => {
    setSteps(prev => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
    setActiveStepIndex(prev => Math.max(0, prev >= index ? prev - 1 : prev));
    setSelectedPlayerId(null);
    markDirty();
  }, [markDirty]);

  // ── Player mutations ────────────────────────────────────────────────────
  const updatePlayer = useCallback((playerId: string, updates: Partial<PlayerData>) => {
    updateStep(activeStepIndex, s => ({
      ...s,
      players: s.players.map(p => p.id === playerId ? { ...p, ...updates } : p),
    }));
  }, [updateStep, activeStepIndex]);

  const setBallCarrier = useCallback((playerId: string, hasBall: boolean) => {
    updateStep(activeStepIndex, s => ({
      ...s,
      players: s.players.map(p => ({
        ...p,
        has_ball: hasBall ? p.id === playerId : p.id === playerId ? false : p.has_ball,
      })),
    }));
  }, [updateStep, activeStepIndex]);

  const removePlayer = useCallback((playerId: string) => {
    updateStep(activeStepIndex, s => ({
      ...s,
      players: s.players.filter(p => p.id !== playerId),
      lines: s.lines.filter(l => l.from_player_id !== playerId && l.to_player_id !== playerId),
    }));
    setSelectedPlayerId(null);
  }, [updateStep, activeStepIndex]);

  const clearPlayerLines = useCallback((playerId: string) => {
    updateStep(activeStepIndex, s => ({
      ...s,
      lines: s.lines.filter(l => l.from_player_id !== playerId),
    }));
  }, [updateStep, activeStepIndex]);

  // ── Line mutations ──────────────────────────────────────────────────────
  const addLine = useCallback((line: Omit<LineData, 'id'>) => {
    const newLine: LineData = { ...line, id: `line_${Date.now()}_${Math.random().toString(36).slice(2, 5)}` };
    updateStep(activeStepIndex, s => ({ ...s, lines: [...s.lines, newLine] }));
  }, [updateStep, activeStepIndex]);

  const deleteLine = useCallback((lineId: string) => {
    updateStep(activeStepIndex, s => ({ ...s, lines: s.lines.filter(l => l.id !== lineId) }));
  }, [updateStep, activeStepIndex]);

  // ── Annotation mutations ────────────────────────────────────────────────
  const addAnnotation = useCallback((ann: Omit<AnnotationData, 'id'>) => {
    const newAnn: AnnotationData = { ...ann, id: `ann_${Date.now()}_${Math.random().toString(36).slice(2, 5)}` };
    updateStep(activeStepIndex, s => ({ ...s, annotations: [...s.annotations, newAnn] }));
  }, [updateStep, activeStepIndex]);

  const deleteAnnotation = useCallback((annId: string) => {
    updateStep(activeStepIndex, s => ({ ...s, annotations: s.annotations.filter(a => a.id !== annId) }));
  }, [updateStep, activeStepIndex]);

  // ── Initialise from template ────────────────────────────────────────────
  const loadTemplate = useCallback((players: PlayerData[], zone: FieldZone) => {
    const ballPlayer = players.find(p => p.id === 'a9') ?? players.find(p => p.team === 'attack');
    const withBall = players.map(p => ({ ...p, has_ball: p.id === ballPlayer?.id }));
    setSteps([{ step_id: makeStepId(), players: withBall, lines: [], annotations: [] }]);
    setActiveStepIndex(0);
    setActiveZone(zone);
    setIsDirty(false);
  }, []);

  // ── Save ────────────────────────────────────────────────────────────────
  const save = useCallback(async (): Promise<boolean> => {
    if (!supabase) return false;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    setIsSaving(true);
    try {
      const playData = {
        id: playId ?? '',
        title: playTitle || 'Untitled Play',
        zone: activeZone,
        info: playInfo,
        steps,
      };

      if (playId) {
        const { error } = await supabase
          .from('plays')
          .update({ title: playTitle || 'Untitled Play', play_data: playData })
          .eq('id', playId)
          .eq('created_by', user.id);
        if (error) throw error;
      } else {
        const base = (playTitle || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const slug = `${base}-${Math.random().toString(36).slice(2, 8)}`;
        const { data, error } = await supabase.from('plays').insert({
          title: playTitle || 'Untitled Play',
          slug,
          difficulty: playDifficulty,
          category: playCategory,
          is_library_play: false,
          created_by: user.id,
          play_data: playData,
          published: false,
        }).select().single();
        if (error) throw error;
        if (data) {
          setPlayId(data.id as string);
          setSavedSlug(data.slug as string);
        }
      }

      setIsDirty(false);
      return true;
    } catch {
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [supabase, playId, playTitle, activeZone, playInfo, steps, playDifficulty, playCategory]);

  // ── Auto-save every 30s when dirty ─────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      if (isDirtyRef.current && playId) void save();
    }, 30_000);
    return () => clearInterval(interval);
  }, [save, playId]);

  // ── Keyboard shortcuts ──────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        void save();
        return;
      }
      if (e.key === 'v' || e.key === 'V' || e.key === 'Escape') setActiveTool('select');
      if (e.key === 'r' || e.key === 'R') setActiveTool('run');
      if (e.key === 'p' || e.key === 'P') setActiveTool('pass');
      if (e.key === 'e' || e.key === 'E') setActiveTool('eraser');
      if (e.key === 't' || e.key === 'T') setActiveTool('text');
      if (e.key === 'a' || e.key === 'A') setActiveTool('arrow');
      if (e.key === 'c' || e.key === 'C') setActiveTool('circle');
      if (e.key === 'x' || e.key === 'X') setActiveTool('target');
      if (e.key === '1') setActiveOption(1);
      if (e.key === '2') setActiveOption(2);
      if (e.key === '3') setActiveOption(3);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [save]);

  return {
    steps, activeStepIndex, activeStep,
    activeTool, setActiveTool,
    activeOption, setActiveOption,
    activeZone, setActiveZone,
    playTitle, setPlayTitle,
    playDifficulty, setPlayDifficulty,
    playCategory, setPlayCategory,
    playInfo, setPlayInfo,
    passFromId, setPassFromId,
    selectedPlayerId, setSelectedPlayerId,
    isDirty, isSaving,
    playId, savedSlug,
    // mutations
    addStep, insertStep, deleteStep,
    setActiveStepIndex,
    updatePlayer, setBallCarrier, removePlayer, clearPlayerLines,
    addLine, deleteLine,
    addAnnotation, deleteAnnotation,
    loadTemplate,
    save,
  };
}
