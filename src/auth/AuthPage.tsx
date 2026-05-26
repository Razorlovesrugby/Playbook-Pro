import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { sendMagicLink } from './auth';

export function AuthPage() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(searchParams.get('error'));
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    const { error: sendError } = await sendMagicLink(email);
    setIsLoading(false);

    if (sendError) {
      setError('Sign-in is temporarily unavailable. Try again in a moment.');
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center space-y-4">
          <h1 className="text-white text-2xl font-bold">Check your email</h1>
          <p className="text-white/60 text-sm">
            We sent a sign-in link to <strong className="text-white">{email}</strong>
          </p>
          <p className="text-white/40 text-xs">Click the link in the email to continue.</p>
          <button
            onClick={() => setSubmitted(false)}
            className="text-white/50 text-sm hover:text-white underline min-h-11"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-4">
      <div className="max-w-sm w-full space-y-6">
        <div>
          <h1 className="text-white text-2xl font-bold">Playbook</h1>
          <p className="text-white/50 text-sm mt-1">Sign in to save and share plays</p>
        </div>

        <form onSubmit={e => void handleSubmit(e)} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Your email address"
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-white/40"
            autoFocus
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-[#0a0f1a] font-semibold py-3 rounded hover:bg-white/90 disabled:opacity-50 min-h-11"
          >
            {isLoading ? 'Sending…' : 'Send Magic Link'}
          </button>
        </form>

        <p className="text-white/30 text-xs text-center">
          No password needed. We&apos;ll send a one-time sign-in link.
        </p>
      </div>
    </div>
  );
}
