# Vrema

Time tracking from Google Calendar. Title events as `project#activity description`, sync, and get projects, hours, and team visibility without timers.

**Live app:** [https://vrema.dev](https://vrema.dev) 

<img width="1502" height="858" alt="image" src="https://github.com/user-attachments/assets/19a321e7-6a0c-4dfe-a20f-3ae394074657" />


## Features

- Google OAuth sign-in (read-only calendar events)
- Sync primary Google Calendar into projects and hours
- Personal week calendar + manual time entries
- **Shared team workspace** — invite teammates; each person syncs their own calendar; team view aggregates hours
- Categories, project settings, invoicing helpers
- Demo preview at `/preview`

## Stack

- Vite + React + TypeScript
- Tailwind CSS + shadcn/ui
- Zustand (UI preferences)
- Supabase Postgres + Edge Function (`team`) for workspaces / members / invites / time entries
- Vercel for hosting + `/api/*` (feedback, waitlist, invite email via Resend)
- Google Calendar API

## Local development

```bash
git clone https://github.com/jaysonfeldman/vrema.git
cd vrema
npm install
cp .env.example .env
# fill VITE_GOOGLE_CLIENT_ID and VITE_SUPABASE_ANON_KEY
npm run dev
```

### Required env

| Variable | Where | Purpose |
|---|---|---|
| `VITE_GOOGLE_CLIENT_ID` | Client | Google OAuth client ID |
| `VITE_SUPABASE_URL` | Client | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Client | Publishable/anon key (DB is RLS-locked; APIs use service role server-side) |
| `VITE_TEAM_API_URL` | Client | Edge Function URL (`…/functions/v1/team`) |
| `VITE_DEV_AUTH_BYPASS` | Client | `false` in production |
| `RESEND_API_KEY` | Vercel only | Invite / feedback email |
| `FEEDBACK_TO_EMAIL` / `FEEDBACK_FROM_EMAIL` | Vercel only | Feedback routing |

Never put `SUPABASE_SERVICE_ROLE_KEY` or database passwords in `VITE_*` variables.

## Scripts

```bash
npm run dev      # local Vite
npm run build    # production build
npm run lint     # ESLint
```
