import { useState } from 'react';

interface ShareButtonProps {
  slug: string;
  title: string;
}

export function ShareButton({ slug, title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/moves/${slug}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled — not an error
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 border border-white/20 rounded text-white/70 hover:text-white text-sm transition-colors min-h-11"
    >
      {copied ? '✓ Copied!' : '↗ Share'}
    </button>
  );
}
