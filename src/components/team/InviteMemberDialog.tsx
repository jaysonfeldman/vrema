import { useState } from 'react';
import { Check, Copy, Link2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTeamStore } from '@/hooks/useTeamStore';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { useToast } from '@/hooks/use-toast';
import { sound } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import type { TeamInvite } from '@/lib/types';

const softInput =
  'rounded-xl border-transparent bg-[#f6f6f6] shadow-none focus-visible:ring-1 focus-visible:ring-foreground/15 dark:bg-white/[0.06]';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function InviteMemberDialog({ open, onOpenChange }: Props) {
  const { authState, getAccessToken } = useGoogleAuth();
  const inviteMember = useTeamStore((s) => s.inviteMember);
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<TeamInvite | null>(null);
  const [copied, setCopied] = useState(false);

  const reset = () => {
    setName('');
    setEmail('');
    setCreated(null);
    setCopied(false);
    setBusy(false);
  };

  const inviteUrl = created ? `${window.location.origin}/invite/${created.token}` : '';

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authState.user) return;
    setBusy(true);
    try {
      const accessToken = await getAccessToken();
      const invite = await inviteMember(accessToken, { name, email });
      setCreated(invite);
      sound.success();

      try {
        await fetch('/api/invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: invite.name,
            email: invite.email,
            inviteUrl: `${window.location.origin}/invite/${invite.token}`,
            invitedByName: authState.user.name,
          }),
        });
      } catch {
        // Copy-link still works
      }

      toast({
        title: 'Invite ready',
        description: 'Share the link so they can join your team.',
      });
    } catch (err) {
      sound.error();
      toast({
        title: 'Could not invite',
        description: err instanceof Error ? err.message : 'Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = async () => {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    sound.pop();
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="gap-5 rounded-2xl border-0 shadow-elevated sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a teammate</DialogTitle>
          <DialogDescription>
            Enter their name and email. You’ll get a link to share.
          </DialogDescription>
        </DialogHeader>

        {!created ? (
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="invite-name" className="text-xs text-muted-foreground">
                Name
              </Label>
              <Input
                id="invite-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jayson Feldman"
                required
                className={softInput}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invite-email" className="text-xs text-muted-foreground">
                Email
              </Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jayson@company.com"
                required
                className={softInput}
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" size="sm" className="h-9 rounded-xl" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={busy} className="h-9 rounded-xl">
                Create invite
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl bg-[#f6f6f6] px-3 py-2.5 dark:bg-white/[0.06]">
              <p className="text-sm font-medium">{created.name}</p>
              <p className="text-xs text-muted-foreground">{created.email}</p>
            </div>
            <div className="space-y-1.5">
              <Label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Link2 className="size-3.5" />
                Invite link
              </Label>
              <div className="flex gap-2">
                <Input readOnly value={inviteUrl} className={cn(softInput, 'text-xs')} />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-10 shrink-0 gap-1.5 rounded-xl border-[#ebebeb] dark:border-white/10"
                  onClick={handleCopy}
                >
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                className="h-9 rounded-xl"
                onClick={() => {
                  reset();
                  onOpenChange(false);
                }}
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
