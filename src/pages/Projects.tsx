import { Construction } from 'lucide-react';

export default function Projects() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center rounded-2xl border border-[#ebebeb] bg-elevated px-6 py-16 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)] dark:border-white/[0.08] dark:shadow-none md:px-8">
      <span className="flex size-11 items-center justify-center rounded-2xl bg-nested text-muted-foreground">
        <Construction className="size-5" />
      </span>
      <h2 className="mt-5 text-2xl font-semibold tracking-tight">Projects</h2>
      <p className="mt-2 text-sm text-muted-foreground">In development</p>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
        A dedicated projects view is on the way. For now, track everything from your dashboard.
      </p>
    </div>
  );
}
