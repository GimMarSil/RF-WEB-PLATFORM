import { create } from 'zustand';

interface AppState {
  selectedEmployeeId: string | null;
  setSelectedEmployeeId: (id: string | null) => void;
}

const getInitial = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('employeeNumber');
};

export const useAppStore = create<AppState>((set) => ({
  selectedEmployeeId: getInitial(),
  setSelectedEmployeeId: (id) => {
    if (typeof window !== 'undefined') {
      if (id) {
        localStorage.setItem('employeeNumber', id);
        document.cookie = `employeeNumber=${id}; path=/`;
      } else {
        localStorage.removeItem('employeeNumber');
        document.cookie = 'employeeNumber=; path=/; max-age=0';
      }
    }
    set({ selectedEmployeeId: id });
  },
}));
