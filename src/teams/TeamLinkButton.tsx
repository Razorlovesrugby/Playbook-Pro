import { useState } from 'react';

export function TeamLinkButton({ teamSlug }: { teamSlug: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/team/${teamSlug}`;

  return (
    <button
      onClick={() => {
        void navigator.clipboard.writeText(url).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
      className="flex items-center gap-2 px-3 py-2 border border-white/20 rounded text-sm text-white/60 hover:text-white hover:border-white/40 transition-all min-h-11"
    >
      {copied ? '✓ Copied!' : 'Team Link ↗'}
    </button>
  );
}
