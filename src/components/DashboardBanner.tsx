export default function DashboardBanner() {
  return (
    <div className="relative h-64 w-full shrink-0 md:h-80 lg:h-96">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/banner-clouds.png)' }}
      />

      {/* Fade into surface layer */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 dark:hidden"
        style={{
          background:
            'linear-gradient(to top, var(--surface) 0%, color-mix(in srgb, var(--surface) 70%, transparent) 40%, color-mix(in srgb, var(--surface) 25%, transparent) 70%, transparent 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-3/5 dark:block"
        style={{
          background: [
            'linear-gradient(to top,',
            'var(--surface) 0%,',
            'color-mix(in srgb, var(--surface) 92%, transparent) 12%,',
            'color-mix(in srgb, var(--surface) 78%, transparent) 24%,',
            'color-mix(in srgb, var(--surface) 62%, transparent) 36%,',
            'color-mix(in srgb, var(--surface) 45%, transparent) 48%,',
            'color-mix(in srgb, var(--surface) 28%, transparent) 60%,',
            'color-mix(in srgb, var(--surface) 14%, transparent) 72%,',
            'color-mix(in srgb, var(--surface) 5%, transparent) 84%,',
            'transparent 100%)',
          ].join(' '),
        }}
      />
    </div>
  );
}
