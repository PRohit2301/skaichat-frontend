import { create } from 'zustand'

// ── THEME STORE ────────────────────────────────────────────
// Manages light / dark / custom theme.
// Applied to <html> element as a 'dark' class (Tailwind darkMode: 'class').
// Accent color stored separately for custom theme.

const useThemeStore = create((set) => ({

  // ── STATE ──
  theme: 'light',         // 'light' | 'dark' | 'custom'
  accentColor: '#007AFF', // hex color — used in custom theme

  // ── ACTIONS ──

  // Set theme and apply to DOM immediately
  setTheme: (theme, accentColor = '#007AFF') => {
    // apply dark class to <html> for Tailwind
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // apply accent color as CSS variable
    document.documentElement.style.setProperty('--accent', accentColor)

    set({ theme, accentColor })
  },

  // Called on login — loads saved theme from user object
  loadUserTheme: (themePreference, accentColor) => {
    if (themePreference === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    document.documentElement.style.setProperty('--accent', accentColor || '#007AFF')
    set({ theme: themePreference, accentColor: accentColor || '#007AFF' })
  },

  // Toggle between light and dark quickly
  toggleDark: () => {
    set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark'
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return { theme: newTheme }
    })
  },

}))

export default useThemeStore