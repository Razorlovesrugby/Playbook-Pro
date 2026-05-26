import { useState, type FormEvent } from 'react';

interface TeamSetupProps {
  onSubmit: (name: string) => Promise<void>;
}

export function TeamSetup({ onSubmit }: TeamSetupProps) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter a team name.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await onSubmit(trimmed);
    } catch {
      setError('Could not create your team. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-sm space-y-6">
        <div>
          <h1 className="text-white text-2xl font-bold mb-1">Create your team</h1>
          <p className="text-white/50 text-sm">
            Add plays and share a link with your squad after setup.
          </p>
        </div>

        <form onSubmit={e => void handleSubmit(e)} className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Team name (e.g. Belsize Park RFC)"
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-white/40"
            autoFocus
            maxLength={80}
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="w-full bg-white text-[#0a0f1a] font-semibold py-3 rounded hover:bg-white/90 disabled:opacity-50 min-h-11"
          >
            {isLoading ? 'Creating…' : 'Create Team'}
          </button>
        </form>
      </div>
    </div>
  );
}
