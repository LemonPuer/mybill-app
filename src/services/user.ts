import { api } from './base.ts'

// 用户相关接口
export const register = (data: { username: string; password: string; email: string }) => {
  return api.post('/user/register', {
    data: {
      username: data.username,
      password: data.password,
      email: data.email
    }
  })
}

export const login = (data: { username: string; password: string }) => {
  return api.post('/user/login', {
    data: {
      username: data.username,
      password: data.password
    }
  })
}

export const getUserInfo = () => {
  return api.post('/user/getUserInfo')
}
