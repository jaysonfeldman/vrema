import { Navigate } from 'react-router-dom';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { Button } from '@/components/ui/button';

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

export default function Login() {
  const { signIn, signInDev, authState, isDevAuthBypass } = useGoogleAuth();

  if (authState.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const authenticateGoogle = () => {
    if (isDevAuthBypass) signInDev();
    else signIn();
  };

  return (
    <div className="relative flex min-h-svh flex-col bg-[#f7f7f7] text-neutral-950 antialiased">
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
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

          <Button
            type="button"
            variant="outline"
            onClick={authenticateGoogle}
            className="h-11 w-full rounded-xl border-neutral-200 bg-white text-sm font-medium text-neutral-950 shadow-sm hover:bg-neutral-50 hover:text-neutral-950"
          >
            <GoogleIcon className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>

          <p className="mt-4 text-center text-xs text-neutral-400">
            Google Calendar access is required to track your time.
          </p>
        </div>
      </div>

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
    </div>
  );
}
