import { FormEvent, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';

export default function Home() {
  const { authState } = useGoogleAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (authState.isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      setStatus('success');
      setEmail('');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  return (
    <div className="hide-scrollbar relative min-h-svh overflow-x-hidden overflow-y-auto bg-[#0b0b0c] text-white antialiased">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 95% 55% at 50% 0%, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.03) 40%, transparent 72%)',
        }}
      />
      <header className="relative z-20 flex items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/vrema-logo.png?v=5" alt="Vrema" className="size-5 shrink-0" />
          <span
            className="text-[20px] font-semibold leading-none tracking-tight"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            Vrema
          </span>
        </Link>
        <Link
          to="/login"
          className="font-[Inter,system-ui,sans-serif] text-sm text-white/45 transition-colors hover:text-white/80"
        >
          Sign in
        </Link>
      </header>

      <main className="relative z-20 flex flex-col items-center px-6 pt-8 md:pt-14">
        <div className="flex w-full max-w-[720px] flex-col items-center text-center">
          <img
            src="/vrema-logo.png?v=5"
            alt="Vrema"
            className="mb-8 h-[100px] w-[100px] rounded-[22px] shadow-[0_12px_40px_rgba(0,0,0,0.45)] animate-[fade-up_0.7s_ease-out]"
          />

          <h1
            className="whitespace-nowrap text-[clamp(1.75rem,5.5vw,56px)] font-semibold leading-[1.05] tracking-[-0.03em] animate-[fade-up_0.7s_ease-out_0.08s_both]"
            style={{ fontFamily: '"Inter Display", Inter, system-ui, sans-serif' }}
          >
            Time-tracking, Reinvented
          </h1>

          <p
            className="mt-5 max-w-[40rem] text-balance text-[24px] font-normal leading-[1.35] text-white/50 animate-[fade-up_0.7s_ease-out_0.14s_both]"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            Vrema turns your existing calendar into a smart time tracker. No timers to start, no
            timesheets to fill.
          </p>

          {status === 'success' ? (
            <p className="mt-10 font-[Inter,system-ui,sans-serif] text-sm font-medium text-emerald-300 animate-[fade-up_0.5s_ease-out]">
              You’re on the list. We’ll be in touch.
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-10 flex w-full max-w-[420px] flex-col gap-3 sm:flex-row sm:items-center animate-[fade-up_0.7s_ease-out_0.2s_both]"
            >
              <label className="sr-only" htmlFor="waitlist-email">
                Email
              </label>
              <input
                id="waitlist-email"
                type="email"
                required
                autoComplete="email"
                placeholder="name@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={status === 'loading'}
                className="h-12 flex-1 rounded-full border-0 bg-[#1a1a1c] px-5 font-[Inter,system-ui,sans-serif] text-sm text-white outline-none ring-0 placeholder:text-white/35 focus:outline-none focus:ring-0 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="h-12 shrink-0 rounded-full bg-white px-6 font-[Inter,system-ui,sans-serif] text-sm font-semibold text-neutral-950 transition hover:bg-white/90 active:scale-[0.98] disabled:opacity-60"
              >
                {status === 'loading' ? 'Joining…' : 'Join Waitlist'}
              </button>
            </form>
          )}

          {status === 'error' && (
            <p className="mt-3 font-[Inter,system-ui,sans-serif] text-sm text-red-300">
              {errorMessage}
            </p>
          )}
        </div>
      </main>

      {/* Product preview — side margins, taller frame */}
      <div className="relative z-10 mt-16 w-full animate-[fade-up_0.8s_ease-out_0.28s_both] md:mt-20">
        <div className="relative left-1/2 h-[min(820px,88vh)] w-screen max-w-none -translate-x-1/2 overflow-hidden px-6 sm:px-10 md:px-16 lg:px-24">
          <div className="relative mx-auto h-full w-full max-w-[1280px] overflow-hidden rounded-lg md:rounded-xl">
            <iframe
              title="Vrema interactive preview"
              src="/demo"
              className="absolute inset-0 h-full w-full border-0 bg-canvas"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      <footer className="relative z-20 pb-8 pt-6 text-center font-[Inter,system-ui,sans-serif] text-xs text-white/30">
        <Link to="/about" className="hover:text-white/55">
          About
        </Link>
        <span className="mx-2">·</span>
        <Link to="/privacy" className="hover:text-white/55">
          Privacy
        </Link>
        <span className="mx-2">·</span>
        <Link to="/terms" className="hover:text-white/55">
          Terms
        </Link>
      </footer>
    </div>
  );
}
