import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';

/**
 * Handles magic-link / OAuth redirects from Supabase.
 * Supabase PKCE returns `?code=...`; older links may use the URL hash.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const finish = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        } else {
          const { data, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;
          if (!data.session) {
            throw new Error('No session found. Try requesting a new sign-in link.');
          }
        }

        if (!cancelled) {
          navigate('/', { replace: true });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not complete sign-in.');
        }
      }
    };

    void finish();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 bg-[#f7f7f7] px-6 text-center">
      {error ? (
        <>
          <h1 className="text-xl font-semibold tracking-tight">Sign-in failed</h1>
          <p className="max-w-sm text-sm text-neutral-500">{error}</p>
          <button
            type="button"
            className="mt-2 text-sm font-medium text-neutral-950 underline underline-offset-4"
            onClick={() => navigate('/login', { replace: true })}
          >
            Back to login
          </button>
        </>
      ) : (
        <>
          <Loader2 className="size-5 animate-spin text-neutral-400" />
          <p className="text-sm text-neutral-500">Signing you in…</p>
        </>
      )}
    </div>
  );
}
