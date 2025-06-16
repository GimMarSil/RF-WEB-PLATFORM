import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuthStore } from './useAuthStore';

export function useRequireAuth(redirect = true) {
  const { employeeNumber, setEmployeeNumber } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!employeeNumber) {
      const cookie = document.cookie
        .split('; ')
        .find((r) => r.startsWith('employeeNumber='))
        ?.split('=')[1];
      if (cookie) {
        setEmployeeNumber(cookie);
      } else if (redirect) {
        router.push('/core');
      }
    }
  }, [employeeNumber, redirect, router, setEmployeeNumber]);

  return employeeNumber;
}
