import { useLocation } from 'react-router-dom';

/** Public product preview used by the landing page (and nested inside /demo). */
export function useIsDemoMode() {
  return useLocation().pathname.startsWith('/preview');
}

/** Prefix app paths with `/preview` when inside the public product preview. */
export function useAppPath() {
  const isDemo = useIsDemoMode();
  return (path: string) => {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    if (!isDemo) return normalized;
    return `/preview${normalized === '/app' ? '/app' : normalized}`;
  };
}

export function stripDemoPrefix(pathname: string) {
  if (!pathname.startsWith('/preview')) return pathname;
  const rest = pathname.slice('/preview'.length) || '/';
  if (rest === '/' || rest === '/app') return '/app';
  return rest;
}
