import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useIsAuthenticated } from '@azure/msal-react';
import { useAuthStore } from './store';
export function useRequireAuth() {
  const isAuthenticated = useIsAuthenticated();
  const { employeeNumber } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!employeeNumber) {
      router.push('/landing');
    }
  }, [isAuthenticated, employeeNumber, router]);

  return employeeNumber;
}
