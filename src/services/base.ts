import router from '@/router/index.ts'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserInfoStore } from '../stores/useUserInfoStore.ts'
import getDeviceId from '../utils/DeviceUtil.ts'

export const api = axios.create({
  baseURL: '/api', // 使用相对路径，让 Vite 代理处理
  // timeout: 5000
})

let isRefreshing = false

interface PromiseHandler {
  resolve: (token: string | null) => void
}

let failedQueue: PromiseHandler[] = []

const processQueue = (token: string | null) => {
  failedQueue.forEach((handler) => {
    if (token) {
      handler.resolve(token)
    }
  })

  failedQueue = []
}
// 请求拦截器
api.interceptors.request.use(
  async (config) => {
    const userInfoStore = useUserInfoStore()
    // 检查token是否过期
    if (!userInfoStore.checkOutOfDate) {
      config.headers.Authorization = userInfoStore.accessToken
      return config
    }

    // token过期或者没有token且存在刷新token，调用接口刷新token
    if (userInfoStore.refreshToken && !isRefreshing) {
      isRefreshing = true

      try {
        const newToken = await refreshAccessToken()
        if (!newToken) {
          throw new Error('服务器异常，获取Token失败！')
        }
        processQueue(newToken)
        config.headers.Authorization = newToken
        return config
      } catch (error) {
        console.error('刷新 Token 失败:', error)
        processQueue(null)
        handleLogout()
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    } else if (isRefreshing) {
      // 如果正在刷新token，将请求加入队列
      return new Promise((resolve) => {
        failedQueue.push({
          resolve: (token) => {
            config.headers.Authorization = token
            resolve(config)
          },
        })
      })
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    // 如果业务状态码不是200，显示错误消息
    if (response.data.code !== 200) {
      console.error('请求失败:', response.data)
      ElMessage.error(response.data?.msg || '请求失败')
      return Promise.reject(response)
    }
    return response
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          handleLogout()
          ElMessage.error('登录已过期，请重新登录')
          break
        default:
          ElMessage.error(error.response?.data?.msg || '请求失败，请稍后重试')
      }
    } else {
      ElMessage.error('网络错误，请稍后重试')
    }
    return Promise.reject(error)
  },
)
/**
 * 刷新token
 * @returns newToken
 */
const refreshAccessToken = async () => {
  try {
    const userInfoStore = useUserInfoStore()
    const response = await api.post('/user/refreshToken', {
      refreshToken: userInfoStore.refreshToken,
      deviceId: getDeviceId,
    })
    const { expireTime, refreshToken } = response.data.data
    const accessToken = response.headers.authorization
    // 更新 Pinia Store 中的 Token 和过期时间
    if (!accessToken) {
      throw new Error('服务器异常，获取Token失败！')
    }
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('expireTime', expireTime)

    userInfoStore.$patch({
      refreshToken,
      expireTime,
      accessToken: accessToken,
    })
    return accessToken
  } catch (error) {
    console.error('刷新 Token 失败:', error)
    // 如果刷新失败，可以跳转到登录页面或清除用户信息
    handleLogout()
    return Promise.reject(error)
  }
}

const handleLogout = () => {
  const userInfoStore = useUserInfoStore()
  // 清除 Pinia 中的用户信息
  userInfoStore.$reset()
  // 清除 localStorage 中的 token 和 refreshToken
  localStorage.clear()
  router.push('/login')
}
