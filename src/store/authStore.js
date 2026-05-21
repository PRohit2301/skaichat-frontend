import { create } from 'zustand'

// ── AUTH STORE ─────────────────────────────────────────────
// Stores the logged-in user + JWT token.
// Token is in memory (Zustand) — NOT localStorage (security).
// We use sessionStorage only as a bridge for the axios interceptor.

const useAuthStore = create((set) => ({

  // ── STATE ──
  token: null,      // JWT string
  user: null,       // { id, username, phoneNumber, about, themePreference, accentColor }
  isAuth: false,    // quick boolean check for PrivateRoute

  // ── ACTIONS ──

  // Called after successful signup or login
  setAuth: (token, user) => {
    // store token in sessionStorage so axios interceptor can read it
    sessionStorage.setItem('skai_token', token)
    set({ token, user, isAuth: true })
  },

  // Update user profile (after PUT /api/users/me)
  updateUser: (updatedUser) => {
    set((state) => ({
      user: { ...state.user, ...updatedUser }
    }))
  },

  // Called on sign out or account delete
  clearAuth: () => {
    sessionStorage.removeItem('skai_token')
    set({ token: null, user: null, isAuth: false })
  },

}))

export default useAuthStore