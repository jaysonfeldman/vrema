import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ComponentProps } from 'react';

function isPreviewPath() {
  return typeof window !== 'undefined' && window.location.pathname.startsWith('/preview');
}

/**
 * When the preview is opened with an explicit ?theme=light|dark (i.e. a Framer
 * embed), force that theme. forcedTheme makes next-themes ignore localStorage
 * entirely, so the light and dark embeds can't contaminate each other's stored
 * theme. Without a param (the landing preview), theme behaves normally.
 */
function forcedPreviewTheme(): 'light' | 'dark' | undefined {
  if (typeof window === 'undefined') return undefined;
  if (!window.location.pathname.startsWith('/preview')) return undefined;
  const theme = new URLSearchParams(window.location.search).get('theme');
  return theme === 'light' || theme === 'dark' ? theme : undefined;
}

export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  const preview = isPreviewPath();
  const forcedTheme = forcedPreviewTheme();

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={preview ? 'dark' : 'light'}
      enableSystem={!preview}
      storageKey={preview ? 'vrema-preview-theme' : 'theme'}
      forcedTheme={forcedTheme}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
