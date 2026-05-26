import { useNavigate } from 'react-router-dom';

interface EditorHeaderProps {
  title: string;
  onTitleChange: (t: string) => void;
  isSaving: boolean;
  isDirty: boolean;
  savedSlug: string | null;
  onSave: () => void;
  onPreview: () => void;
  onShare: () => void;
}

export function EditorHeader({
  title, onTitleChange, isSaving, isDirty, savedSlug, onSave, onPreview, onShare,
}: EditorHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-[#0a0f1a] flex-shrink-0">
      <button
        onClick={() => navigate(-1)}
        className="text-white/50 hover:text-white transition-colors text-sm whitespace-nowrap"
      >
        ← Back
      </button>

      <input
        value={title}
        onChange={e => onTitleChange(e.target.value)}
        placeholder="Untitled Play"
        className="flex-1 bg-transparent text-white text-base font-medium outline-none
          border-b border-white/10 focus:border-white/40 pb-0.5 min-w-0 placeholder:text-white/30"
      />

      {isDirty && (
        <span className="text-white/30 text-xs hidden sm:block">Unsaved changes</span>
      )}

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onPreview}
          className="hidden sm:block px-3 py-1.5 text-sm text-white/60 hover:text-white border border-white/10 rounded transition-colors min-h-9"
        >
          Preview
        </button>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="px-4 py-1.5 text-sm bg-white text-[#0a0f1a] font-semibold rounded hover:bg-white/90 disabled:opacity-60 transition-colors min-h-9"
        >
          {isSaving ? 'Saving…' : 'Save'}
        </button>
        {savedSlug && (
          <button
            onClick={onShare}
            className="px-3 py-1.5 text-sm border border-white/20 text-white/70 hover:text-white rounded transition-colors min-h-9"
          >
            Share ↗
          </button>
        )}
      </div>
    </header>
  );
}
