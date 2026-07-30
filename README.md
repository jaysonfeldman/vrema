# Vrema

Time tracking from Google Calendar. Title events as `project#activity description`, sync, and get projects, hours, and team visibility without timers.

**Live app:** [https://vrema.dev](https://vrema.dev)

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

## Team how it works

1. Owner signs in → a workspace is created automatically.
2. Owner invites a teammate (email + secure invite token).
3. Teammate opens `/invite/:token`, signs in with the **invited Google account**, accepts.
4. Each member syncs their own Google Calendar; `#project#activity` events are stored on the shared workspace.
5. Team calendar / hours scope shows everyone’s entries.

Team data is stored in Supabase. The browser never receives the service role key — the `team` Edge Function verifies the Google access token and writes with the service role.

## Security notes

- Legacy Lovable Supabase tables (if any) should stay RLS-enabled with no anon grants.
- New Vrema project tables (`profiles`, `workspaces`, `workspace_members`, `workspace_invites`, `time_entries`) have RLS on and **no** anon/authenticated table grants.
- `/api/invite` allowlists invite URL origins and validates email.
- OAuth access tokens are kept in browser storage for the session — treat XSS as a critical boundary (CSP recommended before wide open-source launch).

## Scripts

```bash
npm run dev      # local Vite
npm run build    # production build
npm run lint     # ESLint
```

## Google Cloud

1. Create an OAuth client (Web) with authorized origins for `http://localhost:5173` and `https://vrema.dev`.
2. Enable Google Calendar API.
3. Request scope: `https://www.googleapis.com/auth/calendar.events.readonly` (plus OpenID profile/email).
4. Until verification is approved, add testers under OAuth consent screen → Test users.

## License

Private for now. Intended to be open-sourced after a cleanup pass — contributions welcome once the repo is public.
