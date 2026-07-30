-- Lock down unused public tables until real per-user policies exist.
-- Apply in Supabase Dashboard → SQL Editor (service role / postgres).

ALTER TABLE IF EXISTS public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.calendar_events ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('projects', 'activities', 'calendar_events')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- With RLS on and no policies, deny all for roles that still have grants.
-- Also revoke direct table privileges from API roles.
REVOKE ALL ON TABLE public.projects FROM anon, authenticated;
REVOKE ALL ON TABLE public.activities FROM anon, authenticated;
REVOKE ALL ON TABLE public.calendar_events FROM anon, authenticated;
