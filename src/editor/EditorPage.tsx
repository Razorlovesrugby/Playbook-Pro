import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import type { AnnotationData, OptionNumber, PlayerData } from '../types';
import type { FieldZone } from '../types';
import { useEditorState } from './useEditorState';
import { EditorHeader } from './EditorHeader';
import { ToolBar } from './ToolBar';
import { OptionSelector } from './OptionSelector';
import { ZoneSelector } from './ZoneSelector';
import { StepTabs } from './StepTabs';
import { PlayerPanel } from './PlayerPanel';
import { TemplateSelector } from './TemplateSelector';
import { PlayInfoEditor } from './PlayInfoEditor';
import { PreviewModal } from './PreviewModal';
import { ResponsiveEditorCanvas } from './EditorCanvas';

export function EditorPage() {
  const { playId: routePlayId } = useParams<{ playId?: string }>();
  const ed = useEditorState(routePlayId ?? null);

  const [showTemplates, setShowTemplates] = useState(!routePlayId);
  const [showPreview, setShowPreview] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // ── Player interactions ─────────────────────────────────────────────────
  const handlePlayerClick = useCallback((id: string) => {
    if (ed.activeTool === 'eraser') {
      ed.removePlayer(id);
      return;
    }
    ed.setSelectedPlayerId(prev => prev === id ? null : id);
  }, [ed]);

  const handlePlayerDrag = useCallback((id: string, x: number, y: number) => {
    ed.updatePlayer(id, { x, y });
  }, [ed]);

  // ── Pass tool ───────────────────────────────────────────────────────────
  const handlePassPlayerClick = useCallback((id: string) => {
    if (!ed.passFromId) {
      ed.setPassFromId(id);
      return;
    }
    if (ed.passFromId === id) {
      ed.setPassFromId(null);
      return;
    }
    // Second click — draw pass line
    const fromPlayer = ed.activeStep.players.find(p => p.id === ed.passFromId);
    const toPlayer = ed.activeStep.players.find(p => p.id === id);
    if (fromPlayer && toPlayer) {
      ed.addLine({
        from_player_id: fromPlayer.id,
        to_player_id: toPlayer.id,
        to_x: toPlayer.x,
        to_y: toPlayer.y,
        line_type: 'pass',
        option: ed.activeOption,
      });
    }
    ed.setPassFromId(null);
  }, [ed]);

  // ── Canvas click (deselect/cancel) ──────────────────────────────────────
  const handleCanvasClick = useCallback(() => {
    ed.setSelectedPlayerId(null);
    ed.setPassFromId(null);
  }, [ed]);

  // ── Draw run line ───────────────────────────────────────────────────────
  const handleDrawLine = useCallback((fromId: string, toX: number, toY: number, type: 'run' | 'pass', option: OptionNumber) => {
    ed.addLine({ from_player_id: fromId, to_x: toX, to_y: toY, line_type: type, option });
  }, [ed]);

  // ── Draw annotation ─────────────────────────────────────────────────────
  const handleDrawAnnotation = useCallback((ann: Omit<AnnotationData, 'id'>) => {
    ed.addAnnotation(ann);
  }, [ed]);

  // ── Text place ──────────────────────────────────────────────────────────
  const handleTextPlace = useCallback((gridX: number, gridY: number) => {
    const text = prompt('Enter text:');
    if (text) {
      ed.addAnnotation({ type: 'text', x: gridX, y: gridY, text });
    }
  }, [ed]);

  // ── Save + share ────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    const ok = await ed.save();
    if (!ok) alert('Save failed. Please try again.');
  }, [ed]);

  const handleShare = useCallback(() => {
    if (!ed.savedSlug) return;
    const url = `${window.location.origin}/moves/${ed.savedSlug}`;
    void navigator.clipboard.writeText(url).then(() => alert('Link copied!'));
  }, [ed]);

  // ── Template selection ──────────────────────────────────────────────────
  const handleTemplateSelect = useCallback((players: PlayerData[], zone: FieldZone) => {
    ed.loadTemplate(players, zone);
    setShowTemplates(false);
  }, [ed]);

  // ── Selected player ─────────────────────────────────────────────────────
  const selectedPlayer = ed.selectedPlayerId
    ? ed.activeStep.players.find(p => p.id === ed.selectedPlayerId) ?? null
    : null;

  return (
    <div className="h-screen flex flex-col bg-[#0a0f1a] text-white overflow-hidden">
      <EditorHeader
        title={ed.playTitle}
        onTitleChange={ed.setPlayTitle}
        isSaving={ed.isSaving}
        isDirty={ed.isDirty}
        savedSlug={ed.savedSlug}
        onSave={() => void handleSave()}
        onPreview={() => setShowPreview(true)}
        onShare={handleShare}
      />

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden">

        {/* Desktop left toolbar */}
        <div className="hidden md:flex flex-col">
          <ToolBar activeTool={ed.activeTool} onChange={ed.setActiveTool} orientation="vertical" />
        </div>

        {/* Centre: canvas + controls */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">

          {/* Mobile toolbar */}
          <div className="md:hidden flex-shrink-0 border-b border-white/10">
            <ToolBar activeTool={ed.activeTool} onChange={ed.setActiveTool} orientation="horizontal" />
          </div>

          {/* Control strip */}
          <div className="flex-shrink-0 flex flex-wrap items-center gap-3 px-3 py-2 border-b border-white/10 bg-[#0d1424]">
            <OptionSelector active={ed.activeOption} onChange={ed.setActiveOption} />

            <div className="w-px h-5 bg-white/10 hidden sm:block" />

            <ZoneSelector active={ed.activeZone} onChange={ed.setActiveZone} />

            <button
              onClick={() => setShowTemplates(true)}
              className="ml-auto px-3 py-1.5 text-xs border border-white/20 text-white/50 hover:text-white rounded transition-colors min-h-9"
            >
              Templates
            </button>

            <button
              onClick={() => setShowInfo(v => !v)}
              className={`px-3 py-1.5 text-xs border rounded transition-colors min-h-9 ${
                showInfo
                  ? 'border-white/40 text-white'
                  : 'border-white/20 text-white/50 hover:text-white'
              }`}
            >
              Info
            </button>
          </div>

          {/* Player panel */}
          {selectedPlayer && (
            <div className="flex-shrink-0 px-3 py-2 border-b border-white/10">
              <PlayerPanel
                player={selectedPlayer}
                onSetBall={hasBall => ed.setBallCarrier(selectedPlayer.id, hasBall)}
                onClearLines={() => ed.clearPlayerLines(selectedPlayer.id)}
                onRemove={() => ed.removePlayer(selectedPlayer.id)}
                onClose={() => ed.setSelectedPlayerId(null)}
              />
            </div>
          )}

          {/* Canvas */}
          <div className="flex-1 overflow-auto p-3">
            <ResponsiveEditorCanvas
              step={ed.activeStep}
              zone={ed.activeZone}
              activeTool={ed.activeTool}
              activeOption={ed.activeOption}
              selectedPlayerId={ed.selectedPlayerId}
              passFromId={ed.passFromId}
              onPlayerClick={handlePlayerClick}
              onPlayerDrag={handlePlayerDrag}
              onLineClick={ed.deleteLine}
              onAnnotationClick={ed.deleteAnnotation}
              onDrawLine={handleDrawLine}
              onDrawAnnotation={handleDrawAnnotation}
              onPassPlayerClick={handlePassPlayerClick}
              onCanvasClick={handleCanvasClick}
              onTextPlace={handleTextPlace}
            />
          </div>

          {/* Step tabs */}
          <div className="flex-shrink-0 px-3 py-2 border-t border-white/10 bg-[#0d1424]">
            <StepTabs
              steps={ed.steps}
              activeIndex={ed.activeStepIndex}
              onSelect={ed.setActiveStepIndex}
              onAdd={ed.addStep}
              onInsert={ed.insertStep}
              onDelete={ed.deleteStep}
            />
          </div>
        </div>

        {/* Desktop right panel — Play Info */}
        {showInfo && (
          <div className="hidden md:flex flex-col w-72 border-l border-white/10 bg-[#0d1424] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="text-white/70 text-sm font-medium">Play Info</span>
              <button
                onClick={() => setShowInfo(false)}
                className="text-white/30 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <PlayInfoEditor
                info={ed.playInfo}
                difficulty={ed.playDifficulty}
                category={ed.playCategory}
                onInfoChange={ed.setPlayInfo}
                onDifficultyChange={ed.setPlayDifficulty}
                onCategoryChange={ed.setPlayCategory}
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile info panel (drawer-like, below canvas) */}
      {showInfo && (
        <div className="md:hidden border-t border-white/10 bg-[#0d1424] max-h-64 overflow-y-auto p-4">
          <PlayInfoEditor
            info={ed.playInfo}
            difficulty={ed.playDifficulty}
            category={ed.playCategory}
            onInfoChange={ed.setPlayInfo}
            onDifficultyChange={ed.setPlayDifficulty}
            onCategoryChange={ed.setPlayCategory}
          />
        </div>
      )}

      {/* Modals */}
      {showTemplates && (
        <TemplateSelector
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplates(false)}
        />
      )}

      {showPreview && (
        <PreviewModal
          steps={ed.steps}
          zone={ed.activeZone}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
