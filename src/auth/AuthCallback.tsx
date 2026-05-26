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
