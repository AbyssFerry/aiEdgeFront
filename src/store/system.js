import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getServiceStatus, getDiskUsage, getMemoryUsage, getModelList } from '@/api/management'

export const useSystemStore = defineStore('system', () => {
  // 服务状态
  const serviceStatus = ref('stopped')
  const serviceInfo = ref({})
  
  // 系统资源
  const memoryUsage = ref({})
  const diskUsage = ref({})
  
  // 模型列表
  const models = ref([])
  
  // 最后更新时间
  const lastUpdate = ref(null)
  
  // 并发控制标志（为每个更新方法使用独立的锁）
  const isUpdatingStatus = ref(false)
  const isUpdatingResources = ref(false)
  const isUpdatingModels = ref(false)
  
  // 轮询定时器
  let statusInterval = null
  let resourceInterval = null
  
  // 更新服务状态
  const updateServiceStatus = async () => {
    if (isUpdatingStatus.value) return
    
    isUpdatingStatus.value = true
    try {
      const status = await getServiceStatus()
      serviceStatus.value = status.status || 'stopped'
      serviceInfo.value = status
      lastUpdate.value = new Date()
    } catch (error) {
      serviceStatus.value = 'stopped'
    } finally {
      isUpdatingStatus.value = false
    }
  }
  
  // 更新系统资源
  const updateSystemResources = async () => {
    if (isUpdatingResources.value) return
    
    isUpdatingResources.value = true
    try {
      const [memory, disk] = await Promise.all([
        getMemoryUsage(),
        getDiskUsage()
      ])
      
      memoryUsage.value = memory
      diskUsage.value = disk
      lastUpdate.value = new Date()
    } catch (error) {
      // 静默处理错误
    } finally {
      isUpdatingResources.value = false
    }
  }
  
  // 更新模型列表
  const updateModelList = async () => {
    if (isUpdatingModels.value) return
    
    isUpdatingModels.value = true
    try {
      const response = await getModelList()
      models.value = response.files || []
      lastUpdate.value = new Date()
    } catch (error) {
      // 静默处理错误
    } finally {
      isUpdatingModels.value = false
    }
  }
  
  // 开始监控
  const startMonitoring = () => {
    stopMonitoring()
    
    // 立即更新一次
    updateServiceStatus()
    updateSystemResources()
    // 模型列表不再自动轮询，仅在用户手动刷新时更新
    
    // 优化轮询频率：从3秒改为10秒
    statusInterval = setInterval(updateServiceStatus, 10000)
    resourceInterval = setInterval(updateSystemResources, 10000)
  }
  
  // 停止监控
  const stopMonitoring = () => {
    if (statusInterval) {
      clearInterval(statusInterval)
      statusInterval = null
    }
    if (resourceInterval) {
      clearInterval(resourceInterval)
      resourceInterval = null
    }
  }
  
  return {
    // 状态
    serviceStatus,
    serviceInfo,
    memoryUsage,
    diskUsage,
    models,
    lastUpdate,
    
    // 方法
    updateServiceStatus,
    updateSystemResources,
    updateModelList,
    startMonitoring,
    stopMonitoring
  }
})
