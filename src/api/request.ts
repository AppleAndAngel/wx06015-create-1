import axios from 'axios'
import { showToast } from 'vant'
import { getItem } from '@/utils/storage'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

request.interceptors.request.use(
  (config) => {
    const token = getItem<string>('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const message = error.response?.data?.message || '请求失败，请稍后重试'
    showToast(message)
    return Promise.reject(error)
  }
)

export default request
