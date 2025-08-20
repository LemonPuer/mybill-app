import { defineStore } from 'pinia'

// 用户信息 + 登录信息
export const useUserInfoStore = defineStore('userInfo', {
  state: () => ({
    username: '',
    email: '',
    avatarUrl: '',
    description: '',
    accessToken: localStorage.getItem('accessToken') || '',
    expireTime: localStorage.getItem('expireTime') || '0',
    refreshToken: localStorage.getItem('refreshToken') || '',
  }),
  getters: {
    checkOutOfDate: (state): boolean => {
      if (!state.accessToken || !state.expireTime) {
        return true
      }
      const now = BigInt(Date.now().toString())
      const expire = BigInt(state.expireTime)
      return now > expire
    },
  },
  actions: {},
})
