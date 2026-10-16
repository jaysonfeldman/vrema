# Vrema

Time tracking from Google Calendar. Title events as `project#activity description`, sync, and get projects, hours, and team visibility without timers.

**Live app:** [https://vrema.dev](https://vrema.dev) 

<img width="1502" height="858" alt="image" src="https://github.com/user-attachments/assets/19a321e7-6a0c-4dfe-a20f-3ae394074657" />


## Features

- Google OAuth sign-in (read-only calendar events)
- Sync primary Google Calendar into projects and hours
- Personal week calendar + manual time entries saved on this device
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

Use Node.js 24 for development and the built-in test runner. To try the interface
without any external credentials, run `npm ci` and `npm run dev`, then use
**Try the demo** on the login screen (or the `/preview/app` route). Demo entries
are saved in this browser and survive reloads, separately from signed-in accounts.
Source edits update through Vite's hot reload.


```bash
git clone https://github.com/jaysonfeldman/vrema.git
cd vrema
npm install
cp .env.example .env
# for live Google and team features, fill VITE_GOOGLE_CLIENT_ID and VITE_SUPABASE_ANON_KEY
npm run dev
```

### Calendar behavior

- **Sync** imports timed events from your primary Google calendar. All timed
  events appear in the week calendar; only titles like `project#activity description`
  count toward project hours. All-day events are not time entries.
- Enable Google Calendar API for your OAuth project and authorize the development
  origin in its OAuth client settings. Sign in with calendar read permission.
- Google sign-in sessions expire; reconnect when the sync error asks you to.
- Use **Add time**, or drag on the week calendar, to log time directly in Vrema.
  New entries default to the Personal project and Other activity; you can change
  both. Saved entries contribute to dashboard hours and can be moved, edited,
  or deleted.
- Manual entries save in browser `localStorage`, separated by account, and survive
  page reloads and browser restarts. They work without Google or the hosted team
  API. They stay on the current browser/device and are not uploaded or shared;
  clearing site data removes them. Team API responses do not replace local logs.
- Google access is read-only, so Vrema-created entries are not written back to
  Google Calendar.
- The public demo uses sample data and does not import your real calendar.

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
npm test         # Local time persistence and Google Calendar regression tests
npx tsc -p tsconfig.app.json --noEmit # frontend type check
```
