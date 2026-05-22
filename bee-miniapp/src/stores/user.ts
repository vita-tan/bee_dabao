import { defineStore } from 'pinia'

interface BeekeeperUser {
  id: number
  name: string
  phone: string
  avatar?: string
  status: number
  creditScore: number
  level: number
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: uni.getStorageSync('bee_token') as string || '',
    user: (uni.getStorageSync('bee_user') as BeekeeperUser) || null as BeekeeperUser | null,
  }),
  actions: {
    setAuth(token: string, user: BeekeeperUser) {
      this.token = token
      this.user = user
      uni.setStorageSync('bee_token', token)
      uni.setStorageSync('bee_user', user)
    },
    logout() {
      this.token = ''
      this.user = null
      uni.removeStorageSync('bee_token')
      uni.removeStorageSync('bee_user')
    },
    isLoggedIn() {
      return !!this.token
    },
  },
})
