import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const TYPE_LABELS: Record<string, string> = {
  feature: 'Feature request',
  bug: 'Bug report',
  feedback: 'General feedback',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Email is not configured' });
  }

  const { type, title, message, email } = (req.body ?? {}) as {
    type?: string;
    title?: string;
    message?: string;
    email?: string;
  };

  const trimmedTitle = title?.trim() ?? '';
  const trimmedMessage = message?.trim() ?? '';
  const trimmedEmail = email?.trim() ?? '';

  if (!trimmedTitle || !trimmedMessage) {
    return res.status(400).json({ error: 'Title and message are required' });
  }

  if (trimmedTitle.length > 200 || trimmedMessage.length > 5000) {
    return res.status(400).json({ error: 'Message is too long' });
  }

  if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const typeLabel = TYPE_LABELS[type ?? ''] ?? type ?? 'Feedback';
  const to = process.env.FEEDBACK_TO_EMAIL || 'you@example.com';
  const from = process.env.FEEDBACK_FROM_EMAIL || 'Vrema <onboarding@resend.dev>';

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from,
    to: [to],
    ...(trimmedEmail ? { replyTo: trimmedEmail } : {}),
    subject: `[Vrema] ${typeLabel}: ${trimmedTitle}`,
    text: [
      `Type: ${typeLabel}`,
      `From: ${trimmedEmail || 'n/a'}`,
      '',
      trimmedMessage,
    ].join('\n'),
  });

  if (error) {
    console.error('Resend error:', error);
    return res.status(500).json({ error: error.message || 'Failed to send email' });
  }

  return res.status(200).json({ ok: true });
}
