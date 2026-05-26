import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../shared/supabase';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!supabase) {
      navigate('/auth', { replace: true });
      return;
    }

    // Supabase appends error info as hash fragments when a link is invalid/expired.
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const hashError = hashParams.get('error');
    if (hashError) {
      const code = hashParams.get('error_code') ?? '';
      const raw  = hashParams.get('error_description') ?? 'Sign-in failed.';
      const msg  = code === 'otp_expired'
        ? 'Your sign-in link has expired. Please request a new one.'
        : raw.replace(/\+/g, ' ');
      navigate(`/auth?error=${encodeURIComponent(msg)}`, { replace: true });
      return;
    }

    const client = supabase;

    function goToReturnUrl() {
      const returnTo = sessionStorage.getItem('auth_return_to') ?? '/my-plays';
      sessionStorage.removeItem('auth_return_to');
      navigate(returnTo, { replace: true });
    }

    // The client detects the token in the URL hash and signs in automatically.
    const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) goToReturnUrl();
    });

    // If the session is already established by the time we mount, redirect now.
    void client.auth.getSession().then(({ data }) => {
      if (data.session) goToReturnUrl();
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
      <p className="text-white/50 text-sm">Signing you in…</p>
    </div>
  );
}
