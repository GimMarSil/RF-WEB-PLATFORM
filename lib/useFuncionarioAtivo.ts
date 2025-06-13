import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAppStore } from './store';

export function useFuncionarioAtivo(redirect = true) {
  const { selectedEmployeeId, setSelectedEmployeeId } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    if (!selectedEmployeeId) {
      const cookie = document.cookie
        .split('; ')
        .find((r) => r.startsWith('employeeNumber='))
        ?.split('=')[1];
      if (cookie) {
        setSelectedEmployeeId(cookie);
      } else if (redirect) {
        router.push('/core');
      }
    }
  }, [selectedEmployeeId, redirect, router, setSelectedEmployeeId]);

  return selectedEmployeeId;
}
