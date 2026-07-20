import { useLocation } from 'react-router-dom';

export function useIsDemoMode() {
  return useLocation().pathname.startsWith('/demo');
}

/** Prefix app paths with `/demo` when inside the public product preview. */
export function useAppPath() {
  const isDemo = useIsDemoMode();
  return (path: string) => {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    if (!isDemo) return normalized;
    // Demo dashboard lives at /demo (not /demo/app)
    if (normalized === '/app') return '/demo';
    return `/demo${normalized}`;
  };
}

export function stripDemoPrefix(pathname: string) {
  if (!pathname.startsWith('/demo')) return pathname;
  const rest = pathname.slice('/demo'.length) || '/';
  // /demo and legacy /demo/app both map to the dashboard path
  if (rest === '/' || rest === '/app') return '/app';
  return rest;
}
