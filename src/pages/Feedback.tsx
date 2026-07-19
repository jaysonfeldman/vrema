import { useState } from 'react';
import { Check } from 'lucide-react';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const feedbackTypes = [
  { value: 'feature', label: 'Feature request' },
  { value: 'bug', label: 'Bug report' },
  { value: 'feedback', label: 'General feedback' },
] as const;

type FeedbackType = (typeof feedbackTypes)[number]['value'];

const inputClass =
  'rounded-xl border-transparent bg-[#f6f6f6] shadow-none focus-visible:ring-1 focus-visible:ring-foreground/15 dark:bg-white/[0.06]';

export default function Feedback() {
  const { authState } = useGoogleAuth();
  const { toast } = useToast();
  const [type, setType] = useState<FeedbackType>('feature');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(authState.user?.email ?? '');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast({
        title: 'Missing details',
        description: 'Please add a title and message.',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title: title.trim(),
          message: message.trim(),
          email: email.trim(),
        }),
      });

      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send feedback');
      }

      toast({
        title: 'Feedback sent',
        description: 'Thanks. We’ll take a look soon.',
      });
      setTitle('');
      setMessage('');
    } catch (error) {
      toast({
        title: 'Couldn’t send feedback',
        description: error instanceof Error ? error.message : 'Please try again in a moment.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8 pt-6 md:pt-8">
      <header className="space-y-2">
        <p className="text-base font-semibold tracking-tight text-foreground/30">Feedback</p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-[1.75rem]">
          Help improve Vrema
        </h1>
        <p className="text-sm text-muted-foreground">
          Share a feature idea, report a bug, or send general feedback. We’ll read every message.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2.5">
          <Label className="text-sm font-medium">Type</Label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {feedbackTypes.map((option) => {
              const selected = type === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setType(option.value)}
                  className={cn(
                    'flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors',
                    selected
                      ? 'border-[#d4d4d4] bg-[#f6f6f6] font-medium text-foreground dark:border-white/25 dark:bg-white/[0.08]'
                      : 'border-transparent bg-[#f6f6f6]/70 text-muted-foreground hover:bg-[#f0f0f0] dark:bg-white/[0.04] dark:hover:bg-white/[0.06]'
                  )}
                >
                  <span>{option.label}</span>
                  {selected && (
                    <Check className="size-3.5 shrink-0 text-foreground/70" strokeWidth={2.5} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="feedback-title" className="text-sm font-medium">
            Title
          </Label>
          <Input
            id="feedback-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              type === 'bug'
                ? 'Briefly describe the issue'
                : type === 'feature'
                  ? 'What should we add?'
                  : 'What’s on your mind?'
            }
            className={cn('h-11', inputClass)}
            required
            disabled={sending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="feedback-message" className="text-sm font-medium">
            Details
          </Label>
          <Textarea
            id="feedback-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share as much context as you can…"
            className={cn('min-h-[140px] resize-y', inputClass)}
            required
            disabled={sending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="feedback-email" className="text-sm font-medium">
            Email <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="feedback-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className={cn('h-11', inputClass)}
            disabled={sending}
          />
        </div>

        <div className="flex items-center justify-end pt-2">
          <Button
            type="submit"
            className="h-10 rounded-xl px-5 text-sm font-medium"
            disabled={sending}
          >
            {sending ? 'Sending…' : 'Send feedback'}
          </Button>
        </div>
      </form>
    </div>
  );
}
