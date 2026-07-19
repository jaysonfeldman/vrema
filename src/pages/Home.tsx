import { Link, Navigate } from 'react-router-dom';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { authState } = useGoogleAuth();

  if (authState.isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="min-h-svh bg-[#f7f7f7] text-neutral-950 antialiased">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <img src="/vrema-logo.png?v=5" alt="Vrema" className="size-8" />
          <span className="text-xl font-semibold tracking-tight">Vrema</span>
        </div>
        <Button
          asChild
          variant="outline"
          className="h-9 rounded-xl border-neutral-200 bg-white px-4 text-sm font-medium shadow-sm hover:bg-neutral-50"
        >
          <Link to="/login">Sign in</Link>
        </Button>
      </header>

      <main className="mx-auto w-full max-w-3xl px-6 pb-16 pt-6 md:pt-10">
        <section className="space-y-5">
          <p className="text-sm font-medium text-neutral-500">Application name: Vrema</p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl">
            Vrema
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-neutral-600">
            Vrema is a time tracking application. Its purpose is to help you track work time from
            Google Calendar by turning calendar events into projects, activities, and hours. Block
            time as you normally would, give each event a short title, and sync. No timers to start
            or stop.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button
              asChild
              className="h-11 rounded-xl px-5 text-sm font-medium"
            >
              <Link to="/login">Get started with Google</Link>
            </Button>
            <Link
              to="/privacy"
              className="text-sm font-medium text-neutral-600 underline underline-offset-4 hover:text-neutral-950"
            >
              Privacy Policy
            </Link>
          </div>
        </section>

        <section className="mt-14 space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Purpose of Vrema</h2>
          <p className="text-[15px] leading-relaxed text-neutral-600">
            The purpose of Vrema is time tracking for freelancers, consultants, and anyone who plans
            work in Google Calendar. Vrema reads your calendar events and organizes them into
            projects, activities, and hours so you can review dashboards and export timesheets.
          </p>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">What Vrema does</h2>
          <div className="space-y-3 text-[15px] leading-relaxed text-neutral-600">
            <p>
              After you connect your Google account, Vrema reads your calendar events and organizes
              them into:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="font-medium text-neutral-900">Projects</strong>, based on the
                project name in each event title
              </li>
              <li>
                <strong className="font-medium text-neutral-900">Activities</strong>, based on the
                activity tag after the hashtag
              </li>
              <li>
                <strong className="font-medium text-neutral-900">Hours</strong>, based on each
                event’s start and end time
              </li>
            </ul>
            <p>
              You can review dashboards, explore activity breakdowns, and export hours for your
              own records.
            </p>
          </div>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">How it works</h2>
          <ol className="list-decimal space-y-3 pl-5 text-[15px] leading-relaxed text-neutral-600">
            <li>Sign in with Google and grant read-only calendar access.</li>
            <li>
              Title calendar events using this format:{' '}
              <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[13px] text-neutral-900">
                project#activity description
              </code>
            </li>
            <li>
              Example:{' '}
              <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[13px] text-neutral-900">
                vrema#design landing page
              </code>
            </li>
            <li>Sync from Vrema so your projects, activities, and hours update automatically.</li>
          </ol>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Why Vrema requests Google user data
          </h2>
          <div className="space-y-3 text-[15px] leading-relaxed text-neutral-600">
            <p>
              Vrema asks for access to your Google account profile and Google Calendar so it can
              provide its core time tracking features. Specifically:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="font-medium text-neutral-900">Basic profile and email</strong>{' '}
                are used to sign you in and show your account in the app.
              </li>
              <li>
                <strong className="font-medium text-neutral-900">
                  Read-only Google Calendar and calendar events access
                </strong>{' '}
                is used to fetch event titles and times, then calculate projects, activities, and
                hours.
              </li>
            </ul>
            <p>
              Vrema does not create, edit, or delete calendar events. Calendar access is read-only.
              We do not sell your Google user data, and we do not use it for advertising. Our use of
              information received from Google APIs complies with the Google API Services User Data
              Policy, including the Limited Use requirements.
            </p>
            <p>
              Full details are in our{' '}
              <Link
                to="/privacy"
                className="font-medium text-neutral-900 underline underline-offset-4 hover:text-neutral-700"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Who it’s for</h2>
          <p className="text-[15px] leading-relaxed text-neutral-600">
            Vrema is built for people who already use Google Calendar to plan client work, project
            blocks, and meetings, and who want those blocks converted into a clean timesheet without
            a separate timer workflow.
          </p>
        </section>

        <section className="mt-12 rounded-2xl bg-white px-6 py-7">
          <h2 className="text-xl font-semibold tracking-tight">Start tracking from your calendar</h2>
          <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-neutral-600">
            Connect Google, title your events, and sync. Vrema handles the categorization and time
            tracking from there.
          </p>
          <Button asChild className="mt-5 h-11 rounded-xl px-5 text-sm font-medium">
            <Link to="/login">Sign in with Google</Link>
          </Button>
        </section>
      </main>

      <footer className="border-t border-neutral-200/80 px-6 py-8 text-center text-xs text-neutral-400">
        <p className="mb-2">
          Operated by Jayson Feldman ·{' '}
          <a
            href="mailto:jaysonfeldman@gmail.com"
            className="hover:text-neutral-600"
          >
            jaysonfeldman@gmail.com
          </a>
        </p>
        <div>
          <span>Vrema © {new Date().getFullYear()}</span>
          <span className="mx-2">·</span>
          <Link to="/privacy" className="hover:text-neutral-600">
            Privacy Policy
          </Link>
          <span className="mx-2">·</span>
          <Link to="/terms" className="hover:text-neutral-600">
            Terms of Service
          </Link>
        </div>
      </footer>
    </div>
  );
}
