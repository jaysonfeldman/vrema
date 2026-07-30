import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { teamApi } from '@/lib/teamApi';
import { useTeamStore } from '@/hooks/useTeamStore';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { sound } from '@/lib/sounds';
import { cn } from '@/lib/utils';

type PreviewInvite = {
  id: string;
  name: string;
  email: string;
  status: string;
  invitedByName: string;
};

export default function AcceptInvite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { authState, getAccessToken, signIn } = useGoogleAuth();
  const acceptInvite = useTeamStore((s) => s.acceptInvite);
  const [invite, setInvite] = useState<PreviewInvite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await teamApi.previewInvite(token);
        if (!cancelled) setInvite(data.invite);
      } catch {
        if (!cancelled) setInvite(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;
    if (!authState.isAuthenticated) {
      signIn();
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const accessToken = await getAccessToken();
      const result = await acceptInvite(accessToken, token);
      if (!result.ok) {
        setError(result.error ?? 'Could not accept invite');
        sound.error();
        return;
      }
      setDone(true);
      sound.success();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not accept invite');
      sound.error();
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <Shell>
        <p className="text-sm text-muted-foreground">Loading invite…</p>
      </Shell>
    );
  }

  if (!token || !invite) {
    return (
      <Shell>
        <Users className="mx-auto size-10 text-muted-foreground/40" />
        <h1 className="mt-4 text-xl font-semibold tracking-tight">Invite not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This link looks invalid or was revoked. Ask your teammate to send a new one.
        </p>
        <Button asChild className="mt-6 rounded-xl" size="sm">
          <Link to="/">Home</Link>
        </Button>
      </Shell>
    );
  }

  if (invite.status === 'accepted') {
    return (
      <Shell>
        <CheckCircle2 className="mx-auto size-10 text-emerald-500" />
        <h1 className="mt-4 text-xl font-semibold tracking-tight">Already accepted</h1>
        <Button size="sm" className="mt-6 rounded-xl" onClick={() => navigate('/calendar')}>
          Open calendar
        </Button>
      </Shell>
    );
  }

  if (done) {
    return (
      <Shell>
        <CheckCircle2 className="mx-auto size-10 text-emerald-500" />
        <h1 className="mt-4 text-xl font-semibold tracking-tight">You’re on the team</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Welcome. Sync your Google Calendar to share hours with the team.
        </p>
        <Button size="sm" className="mt-6 rounded-xl" onClick={() => navigate('/calendar')}>
          Open calendar
        </Button>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#f6f6f6] text-muted-foreground dark:bg-white/[0.06]">
        <Users className="size-5" />
      </div>
      <h1 className="mt-4 text-xl font-semibold tracking-tight">
        Join {invite.invitedByName}&apos;s team
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sign in with <strong className="font-medium text-foreground">{invite.email}</strong> to
        accept this invite and track time together.
      </p>
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      <Button size="sm" className="mt-6 w-full rounded-xl" disabled={busy} onClick={handleAccept}>
        {!authState.isAuthenticated
          ? 'Sign in with Google to join'
          : busy
            ? 'Joining…'
            : 'Accept invite'}
      </Button>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-canvas px-4">
      <div className={cn('w-full max-w-md rounded-2xl bg-elevated p-8 text-center shadow-elevated')}>
        <div className="mb-6 flex items-center justify-center gap-2">
          <img src="/vrema-logo.png?v=5" alt="Vrema" className="size-5" />
          <span className="text-lg font-semibold tracking-tight">Vrema</span>
        </div>
        {children}
      </div>
    </div>
  );
}
