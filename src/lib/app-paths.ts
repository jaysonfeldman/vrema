import { useLocation } from 'react-router-dom';

export function useIsDemoMode() {
  return useLocation().pathname.startsWith('/demo');
}

/** Prefix app paths with `/demo` when inside the public product preview. */
export function useAppPath() {
  const isDemo = useIsDemoMode();
  return (path: string) => {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return isDemo ? `/demo${normalized}` : normalized;
  };
}

export function stripDemoPrefix(pathname: string) {
  return pathname.startsWith('/demo') ? pathname.slice('/demo'.length) || '/' : pathname;
}
