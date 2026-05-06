import { create } from 'zustand';

export type AuthModalView = 'login' | 'signup' | 'reset';

interface AuthModalState {
  isOpen: boolean;
  view: AuthModalView;
  next?: string;
  openAuthModal: (view?: AuthModalView, next?: string) => void;
  changeAuthModalView: (view: AuthModalView) => void;
  closeAuthModal: () => void;
}

export const useAuthModal = create<AuthModalState>((set) => ({
  isOpen: false,
  view: 'login',
  next: undefined,
  openAuthModal: (view = 'login', next) => set({ isOpen: true, view, next }),
  changeAuthModalView: (view) => set({ view }),
  closeAuthModal: () => set({ isOpen: false, next: undefined }),
}));
