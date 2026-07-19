import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ComponentProps } from 'react';

function isDemoPath() {
  return typeof window !== 'undefined' && window.location.pathname.startsWith('/demo');
}

export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  const demo = isDemoPath();

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={demo ? 'dark' : 'light'}
      enableSystem={!demo}
      storageKey={demo ? 'vrema-demo-theme' : 'theme'}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
