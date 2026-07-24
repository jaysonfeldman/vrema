import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, inviteUrl, invitedByName } = (req.body ?? {}) as {
    name?: string;
    email?: string;
    inviteUrl?: string;
    invitedByName?: string;
  };

  const trimmedName = name?.trim() ?? '';
  const trimmedEmail = email?.trim() ?? '';
  const trimmedUrl = inviteUrl?.trim() ?? '';
  const fromName = invitedByName?.trim() || 'A teammate';

  if (!trimmedName || !trimmedEmail || !trimmedUrl) {
    return res.status(400).json({ error: 'Name, email, and inviteUrl are required' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Local / unconfigured: client still has a copyable invite link.
    return res.status(200).json({ ok: true, emailed: false });
  }

  const from = process.env.INVITE_FROM_EMAIL || process.env.FEEDBACK_FROM_EMAIL || 'Vrema <onboarding@resend.dev>';
  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from,
    to: [trimmedEmail],
    subject: `${fromName} invited you to Vrema`,
    text: [
      `Hi ${trimmedName},`,
      '',
      `${fromName} invited you to join their team on Vrema.`,
      '',
      `Accept the invite: ${trimmedUrl}`,
      '',
      'Once you join, you can log hours on the shared team calendar.',
    ].join('\n'),
  });

  if (error) {
    console.error('Invite email error:', error);
    return res.status(500).json({ error: error.message || 'Failed to send invite email' });
  }

  return res.status(200).json({ ok: true, emailed: true });
}
