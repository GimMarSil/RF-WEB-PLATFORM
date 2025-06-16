import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthState {
  employeeNumber: string | null;
  userName: string | null;
  roles: string[];
  setEmployee: (employeeNumber: string | null, userName: string | null, roles?: string[]) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      employeeNumber: null,
      userName: null,
      roles: [],
      setEmployee: (employeeNumber, userName, roles = []) =>
        set({ employeeNumber, userName, roles }),
      clearSession: () => set({ employeeNumber: null, userName: null, roles: [] })
    }),
    { name: 'auth-storage' }
  )
);
