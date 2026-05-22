import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AdminUser {
  id: number
  username: string
  realName: string
  role: string
  regionCode: string
  phone?: string
}

interface AuthState {
  token: string | null
  user: AdminUser | null
  setAuth: (token: string, user: AdminUser) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => {
        localStorage.setItem('bee_admin_token', token)
        set({ token, user })
      },
      logout: () => {
        localStorage.removeItem('bee_admin_token')
        localStorage.removeItem('bee_admin_user')
        set({ token: null, user: null })
      },
    }),
    {
      name: 'bee_admin_auth',
    },
  ),
)
