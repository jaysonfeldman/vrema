import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ComponentProps } from 'react';

function isPreviewPath() {
  return typeof window !== 'undefined' && window.location.pathname.startsWith('/preview');
}

export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  const preview = isPreviewPath();

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={preview ? 'dark' : 'light'}
      enableSystem={!preview}
      storageKey={preview ? 'vrema-preview-theme' : 'theme'}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
