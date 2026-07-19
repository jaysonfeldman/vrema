import { Link } from 'react-router-dom';

export function LegalPage({
  title,
  effectiveDate,
  children,
}: {
  title: string;
  effectiveDate: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh bg-[#f7f7f7] text-neutral-950 antialiased">
      <div className="mx-auto w-full max-w-2xl px-6 py-12 md:py-16">
        <header className="mb-10 space-y-3">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-neutral-500 transition-colors hover:text-neutral-800"
          >
            ← Back to Vrema
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-neutral-500">Effective date: {effectiveDate}</p>
        </header>

        <article className="space-y-8 text-sm leading-relaxed text-neutral-700 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-neutral-950 [&_li]:pl-0 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_p]:text-neutral-700 [&_strong]:font-medium [&_strong]:text-neutral-900 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
          {children}
        </article>

        <footer className="mt-14 border-t border-neutral-200 pt-6 text-xs text-neutral-400">
          <span>Vrema © {new Date().getFullYear()}</span>
          <span className="mx-2">·</span>
          <Link to="/privacy" className="hover:text-neutral-600">
            Privacy
          </Link>
          <span className="mx-2">·</span>
          <Link to="/terms" className="hover:text-neutral-600">
            Terms
          </Link>
        </footer>
      </div>
    </div>
  );
}
