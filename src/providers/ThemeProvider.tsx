import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useState, type ComponentProps } from 'react';

function isPreviewPath() {
  return typeof window !== 'undefined' && window.location.pathname.startsWith('/preview');
}

/** ?theme=light|dark on a preview URL (i.e. a Framer embed), else undefined. */
function previewThemeParam(): 'light' | 'dark' | undefined {
  if (typeof window === 'undefined') return undefined;
  if (!window.location.pathname.startsWith('/preview')) return undefined;
  const theme = new URLSearchParams(window.location.search).get('theme');
  return theme === 'light' || theme === 'dark' ? theme : undefined;
}

export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  const preview = isPreviewPath();
  const param = previewThemeParam();

  // Each embed gets its OWN storage key so the light and dark embeds can't
  // overwrite each other's theme. The toggle still works and persists per key.
  const storageKey = preview
    ? `vrema-preview-theme${param ? `-${param}` : ''}`
    : 'theme';

  // For a Framer embed (?theme=…), always open in the URL theme on each load.
  // A viewer's earlier toggle shouldn't leave the marketing embed stuck in the
  // wrong theme, so we reseed storage once on mount. The in-session toggle
  // still works and persists until the next reload. Runs once (lazy init).
  useState(() => {
    if (preview && param && typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, param);
    }
    return null;
  });

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={preview ? (param ?? 'dark') : 'light'}
      enableSystem={!preview}
      storageKey={storageKey}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
