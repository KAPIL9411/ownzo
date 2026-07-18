import { create } from 'zustand'

interface UIState {
  isMobileMenuOpen: boolean
  isSearchOpen: boolean
  toggleMobileMenu: () => void
  toggleSearch: () => void
  closeMobileMenu: () => void
  closeSearch: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  isSearchOpen: false,
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  toggleSearch: () =>
    set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  closeSearch: () => set({ isSearchOpen: false }),
}))
