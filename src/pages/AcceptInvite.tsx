import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { decodeInviteToken, useTeamStore } from '@/hooks/useTeamStore';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { sound } from '@/lib/sounds';
import { cn } from '@/lib/utils';

const softInput =
  'rounded-xl border-transparent bg-[#f6f6f6] shadow-none focus-visible:ring-1 focus-visible:ring-foreground/15 dark:bg-white/[0.06]';

export default function AcceptInvite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { authState } = useGoogleAuth();
  const invites = useTeamStore((s) => s.invites);
  const acceptInvite = useTeamStore((s) => s.acceptInvite);

  const invite = useMemo(() => {
    if (!token) return null;
    const stored = invites.find((i) => i.token === token);
    if (stored) return stored;
    const decoded = decodeInviteToken(token);
    if (!decoded) return null;
    return {
      id: decoded.id,
      token,
      name: decoded.name,
      email: decoded.email,
      invitedById: decoded.invitedById,
      invitedByName: decoded.invitedByName,
      createdAt: '',
      status: 'pending' as const,
    };
  }, [invites, token]);

  const [name, setName] = useState(authState.user?.name || '');
  const [email, setEmail] = useState(authState.user?.email || '');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!invite) return;
    setName((prev) => prev || invite.name);
    setEmail((prev) => prev || invite.email);
  }, [invite]);

  const handleAccept = () => {
    if (!token) return;

    const result = acceptInvite(token, {
      id: authState.user?.id ?? `member-${token.slice(0, 8)}`,
      name: name.trim() || invite?.name || 'Teammate',
      email: email.trim() || invite?.email || '',
      imageUrl: authState.user?.imageUrl,
    });

    if (!result.ok) {
      setError(result.error ?? 'Could not accept invite');
      sound.error();
      return;
    }

    setDone(true);
    sound.success();
  };

  if (!token || !invite) {
    return (
      <Shell>
        <Users className="mx-auto size-10 text-muted-foreground/40" />
        <h1 className="mt-4 text-xl font-semibold tracking-tight">Invite not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This link looks invalid. Ask your teammate to send a new one.
        </p>
        <Button asChild className="mt-6 rounded-xl" size="sm">
          <Link to="/">Home</Link>
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
          Welcome{name ? `, ${name.split(' ')[0]}` : ''}. You can start logging hours.
        </p>
        <Button
          size="sm"
          className="mt-6 rounded-xl"
          onClick={() => navigate(authState.isAuthenticated ? '/calendar' : '/login')}
        >
          {authState.isAuthenticated ? 'Open calendar' : 'Sign in to continue'}
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
        Confirm your details to join and track time together.
      </p>

      <div className="mt-6 space-y-3 text-left">
        <div className="space-y-1.5">
          <Label htmlFor="accept-name" className="text-xs text-muted-foreground">
            Name
          </Label>
          <Input
            id="accept-name"
            value={name || invite.name}
            onChange={(e) => setName(e.target.value)}
            className={softInput}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="accept-email" className="text-xs text-muted-foreground">
            Email
          </Label>
          <Input
            id="accept-email"
            type="email"
            value={email || invite.email}
            onChange={(e) => setEmail(e.target.value)}
            className={softInput}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <Button size="sm" className="mt-6 w-full rounded-xl" onClick={handleAccept}>
        Accept invite
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
