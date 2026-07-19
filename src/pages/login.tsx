import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function LoginFooter() {
  return (
    <footer className="pb-8 text-center text-xs text-neutral-400">
      <span>Vrema © {new Date().getFullYear()}</span>
      <span className="mx-2">·</span>
      <a href="#" className="hover:text-neutral-600">
        Privacy
      </a>
      <span className="mx-2">·</span>
      <a href="#" className="hover:text-neutral-600">
        Terms
      </a>
    </footer>
  );
}

export default function Login() {
  const { signIn, signInDev, authState, isDevAuthBypass } = useGoogleAuth();
  const { isAuthenticated: hasSupabaseSession, signInWithEmail } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const resendTimers = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      resendTimers.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  if (authState.isAuthenticated || hasSupabaseSession) {
    return <Navigate to="/" replace />;
  }

  const authenticateGoogle = () => {
    if (isDevAuthBypass) signInDev();
    else signIn();
  };

  const sendMagicLink = async (address: string) => {
    const { error } = await signInWithEmail(address);
    if (error) {
      toast({
        title: 'Could not send link',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Sign-in link sent',
      description: `Check ${address} for your link.`,
    });
    return true;
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@') || isSending) return;

    setIsSending(true);
    const ok = await sendMagicLink(trimmed);
    setIsSending(false);

    if (ok) {
      setSentTo(trimmed);
      setResendState('idle');
    }
  };

  const handleResend = async () => {
    if (!sentTo || resendState !== 'idle') return;

    setResendState('sending');
    const ok = await sendMagicLink(sentTo);

    resendTimers.current.forEach((id) => window.clearTimeout(id));
    if (ok) {
      resendTimers.current = [
        window.setTimeout(() => setResendState('sent'), 200),
        window.setTimeout(() => setResendState('idle'), 3000),
      ];
    } else {
      setResendState('idle');
    }
  };

  return (
    <div className="relative flex min-h-svh flex-col bg-[#f7f7f7] text-neutral-950 antialiased">
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        {sentTo ? (
          <div className="flex w-full max-w-[360px] flex-col items-center animate-in fade-in zoom-in-95 duration-300">
            <div className="mb-6 space-y-2 text-center">
              <h1 className="text-[1.75rem] font-semibold tracking-tight">Check your inbox</h1>
              <p className="text-[15px] text-neutral-500">
                We sent a sign in link to <span className="text-neutral-700">{sentTo}</span>
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={handleResend}
              disabled={resendState !== 'idle'}
              className="h-9 rounded-lg px-4 text-sm font-medium"
            >
              {resendState === 'sent' ? 'Sent' : resendState === 'sending' ? 'Sending…' : 'Resend'}
            </Button>
            <button
              type="button"
              onClick={() => setSentTo(null)}
              className="mt-6 text-sm text-neutral-400 hover:text-neutral-600"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <div className="flex w-full max-w-[360px] flex-col items-center">
            <img
              src="/vrema-logo.png?v=5"
              alt="Vrema"
              className="mb-5 size-20 drop-shadow-sm"
            />

            <div className="mb-9 space-y-2 text-center">
              <h1 className="text-[32px] font-semibold leading-tight tracking-tight">
                Welcome to Vrema
              </h1>
              <p className="mx-auto max-w-[320px] text-balance text-[14px] leading-relaxed text-neutral-500">
                Turn your calendar into an effortless timetracker
              </p>
            </div>

            <div className="w-full space-y-3">
              <Button
                type="button"
                variant="outline"
                onClick={authenticateGoogle}
                className="h-11 w-full rounded-xl border-neutral-200 bg-white text-sm font-medium text-neutral-950 shadow-sm hover:bg-neutral-50 hover:text-neutral-950"
              >
                <GoogleIcon className="mr-2 h-4 w-4" />
                Continue with Google
              </Button>

              <div className="flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-neutral-200" />
                <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">
                  Or
                </span>
                <div className="h-px flex-1 bg-neutral-200" />
              </div>

              <form onSubmit={handleContinue} className="space-y-3">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email..."
                  autoComplete="email"
                  required
                  className={cn(
                    'login-email h-11 rounded-xl border-neutral-200 bg-white px-4 text-sm text-neutral-950 shadow-sm',
                    'placeholder:text-neutral-400',
                    'focus-visible:ring-1 focus-visible:ring-neutral-950/10 focus-visible:ring-offset-0'
                  )}
                />
                <Button
                  type="submit"
                  disabled={isSending}
                  className="h-11 w-full rounded-xl bg-neutral-950 text-sm font-medium text-white shadow-[0_6px_20px_rgba(0,0,0,0.14)] hover:bg-neutral-900"
                >
                  {isSending ? 'Sending…' : 'Continue'}
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>

      <LoginFooter />
    </div>
  );
}
