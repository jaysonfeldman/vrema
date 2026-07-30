-- Vrema team schema (applied to project gtqdojchjznvkbzfgzei)
-- Anon/authenticated have no table grants; Edge Functions use service_role.

CREATE TABLE IF NOT EXISTS public.profiles (
  id text PRIMARY KEY,
  email text NOT NULL,
  name text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'My team',
  owner_id text NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.workspace_members (
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'member')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.workspace_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text NOT NULL DEFAULT '',
  token text NOT NULL UNIQUE,
  invited_by text NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  UNIQUE (workspace_id, email)
);

CREATE TABLE IF NOT EXISTS public.time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  description text,
  project_id text,
  project_name text NOT NULL DEFAULT '',
  activity_type text NOT NULL DEFAULT '',
  color text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'draft')),
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'google')),
  google_event_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS time_entries_workspace_start_idx ON public.time_entries (workspace_id, start_time);
CREATE INDEX IF NOT EXISTS time_entries_user_idx ON public.time_entries (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS time_entries_google_event_uidx
  ON public.time_entries (workspace_id, user_id, google_event_id)
  WHERE google_event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS workspace_invites_token_idx ON public.workspace_invites (token);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.profiles FROM anon, authenticated;
REVOKE ALL ON TABLE public.workspaces FROM anon, authenticated;
REVOKE ALL ON TABLE public.workspace_members FROM anon, authenticated;
REVOKE ALL ON TABLE public.workspace_invites FROM anon, authenticated;
REVOKE ALL ON TABLE public.time_entries FROM anon, authenticated;

GRANT ALL ON TABLE public.profiles TO service_role;
GRANT ALL ON TABLE public.workspaces TO service_role;
GRANT ALL ON TABLE public.workspace_members TO service_role;
GRANT ALL ON TABLE public.workspace_invites TO service_role;
GRANT ALL ON TABLE public.time_entries TO service_role;
