import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  employeeNumber: string | null;
  setEmployeeNumber: (id: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      employeeNumber: null,
      setEmployeeNumber: (id) => {
        if (typeof document !== 'undefined') {
          if (id) {
            document.cookie = `employeeNumber=${id}; path=/`;
          } else {
            document.cookie = 'employeeNumber=; path=/; max-age=0';
          }
        }
        set({ employeeNumber: id });
      }
    }),
    { name: 'auth-storage' }
  )
);
