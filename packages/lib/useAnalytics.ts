import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { logEvent } from './analytics';

export function useAnalytics(service: string) {
  const router = useRouter();
  useEffect(() => {
    const handleRoute = (url: string) =>
      logEvent(service, 'navigation', { url });
    const handleError = (event: ErrorEvent) =>
      logEvent(service, 'error', { message: event.message });

    logEvent(service, 'navigation', { url: router.asPath });
    router.events.on('routeChangeComplete', handleRoute);
    window.addEventListener('error', handleError);

    return () => {
      router.events.off('routeChangeComplete', handleRoute);
      window.removeEventListener('error', handleError);
    };
  }, [router, service]);
}
