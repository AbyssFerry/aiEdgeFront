import axios from 'axios'

// 管理服务实例 (端口 23058)
export const managementRequest = axios.create({
  baseURL: '/api/management',
  timeout: 15000, // 优化：默认超时15秒，从120秒改进
  headers: {
    'Content-Type': 'application/json'
  }
})

// 推理服务实例 (端口 23059)
export const inferenceRequest = axios.create({
  baseURL: '/api/inference',
  timeout: 15000, // 优化：默认超时15秒，从120秒改进
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
const requestInterceptor = (config) => {
  // 为文件上传请求设置长超时（300秒 = 5分钟）
  if (config.url && config.url.includes('/upload')) {
    config.timeout = 300000
  }
  
  return config
}

const requestErrorInterceptor = (error) => {
  return Promise.reject(error)
}

// 响应拦截器
const responseInterceptor = (response) => {
  return response.data
}

const responseErrorInterceptor = (error) => {
  if (error.code === 'ERR_NETWORK') {
    return Promise.reject(new Error('无法连接到服务器，请确保后端服务已启动'))
  }
  
  const message = error.response?.data?.detail || error.response?.data?.message || error.message || '请求失败'
  return Promise.reject(new Error(message))
}

// 应用拦截器到两个实例
;[managementRequest, inferenceRequest].forEach(instance => {
  instance.interceptors.request.use(requestInterceptor, requestErrorInterceptor)
  instance.interceptors.response.use(responseInterceptor, responseErrorInterceptor)
})

export default managementRequest
