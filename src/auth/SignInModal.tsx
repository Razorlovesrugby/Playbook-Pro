import { useState } from 'react';
import { sendMagicLink } from './auth';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  /** Path to return to after the magic link is clicked. Defaults to /my-plays. */
  returnTo?: string;
}

export function SignInModal({ isOpen, onClose, title = 'Sign in to save this play', returnTo }: SignInModalProps) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit() {
    setError(null);
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    sessionStorage.setItem('auth_return_to', returnTo ?? '/my-plays');

    setIsLoading(true);
    const { error: sendError } = await sendMagicLink(email);
    setIsLoading(false);

    if (sendError) {
      setError('Sign-in is temporarily unavailable. Try again in a moment.');
      return;
    }
    setSent(true);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111827] rounded-xl p-6 max-w-sm w-full space-y-4 border border-white/10">
        <h2 className="text-white text-lg font-semibold">{title}</h2>
        {!sent ? (
          <>
            <p className="text-white/50 text-sm">Enter your email and we&apos;ll send a sign-in link.</p>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Your email"
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm outline-none focus:border-white/30"
              autoFocus
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => void handleSubmit()}
                disabled={isLoading}
                className="flex-1 bg-white text-[#0a0f1a] font-semibold py-2 rounded text-sm hover:bg-white/90 disabled:opacity-50 min-h-11"
              >
                {isLoading ? 'Sending…' : 'Send Link'}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-white/20 text-white/50 rounded text-sm hover:text-white min-h-11"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <div className="text-center space-y-2">
            <p className="text-white/70 text-sm">Link sent to <strong className="text-white">{email}</strong></p>
            <p className="text-white/40 text-xs">Check your email and click the link to continue.</p>
            <button
              onClick={onClose}
              className="text-white/50 text-sm hover:text-white underline min-h-11"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
