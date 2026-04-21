import { api } from './base.ts'

export interface UserInfoPayload {
  username: string
  email: string
  avatarUrl: string
  description: string
  emailReminderEnabled?: boolean
  monthlySummaryEnabled?: boolean
  reminderSendHour?: number
}

// 用户相关接口
export const register = (data: { username: string; password: string; email: string }) => {
  return api.post('/user/register', {
    data: {
      username: data.username,
      password: data.password,
      email: data.email,
    },
  })
}

export const login = (data: { username: string; password: string }) => {
  return api.post('/user/login', {
    data: {
      username: data.username,
      password: data.password,
    },
  })
}

export const getUserInfo = () => {
  return api.post('/user/getUserInfo')
}

export const updateInfo = (data: Partial<UserInfoPayload>) => {
  return api.post('/user/updateInfo', {
    data: {
      ...data,
    },
  })
}
