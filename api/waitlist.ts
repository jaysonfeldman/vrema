import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Waitlist is not configured' });
  }

  const { email } = (req.body ?? {}) as { email?: string };
  const trimmedEmail = email?.trim().toLowerCase() ?? '';

  if (!trimmedEmail || !EMAIL_RE.test(trimmedEmail)) {
    return res.status(400).json({ error: 'A valid email is required' });
  }

  const to = process.env.FEEDBACK_TO_EMAIL || 'jaysonfeldman@gmail.com';
  const from = process.env.FEEDBACK_FROM_EMAIL || 'Vrema <onboarding@resend.dev>';
  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from,
    to: [to],
    replyTo: trimmedEmail,
    subject: `[Vrema] Waitlist signup: ${trimmedEmail}`,
    text: [`New waitlist signup`, '', `Email: ${trimmedEmail}`].join('\n'),
  });

  if (error) {
    console.error('Resend waitlist error:', error);
    return res.status(500).json({ error: error.message || 'Failed to join waitlist' });
  }

  return res.status(200).json({ ok: true });
}
