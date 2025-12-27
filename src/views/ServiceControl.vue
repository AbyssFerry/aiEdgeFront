<template>
  <div class="service-control space-y-6">
    <!-- 服务状态区域 -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">服务状态</h2>
      
      <div class="flex items-center justify-between">
        <!-- 状态信息 -->
        <div class="flex items-center space-x-6">
          <!-- 状态指示灯 -->
          <div class="flex items-center space-x-3">
            <div
              class="w-4 h-4 rounded-full"
              :class="serviceStatus === 'running' ? 'bg-green-500 pulse' : 'bg-gray-400'"
            ></div>
            <div>
              <p class="text-sm text-gray-500">运行状态</p>
              <p class="text-lg font-semibold" :class="getStatusColor(serviceStatus)">
                {{ getStatusText(serviceStatus) }}
              </p>
            </div>
          </div>
          
          <!-- 运行信息 -->
          <div v-if="serviceInfo.start_time">
            <p class="text-sm text-gray-500">启动时间</p>
            <p class="text-lg font-semibold text-gray-800">
              {{ formatTime(serviceInfo.start_time, 'YYYY-MM-DD HH:mm:ss') }}
            </p>
          </div>
          
          <div v-if="serviceInfo.uptime">
            <p class="text-sm text-gray-500">运行时长</p>
            <p class="text-lg font-semibold text-gray-800">
              {{ serviceInfo.uptime }}
            </p>
          </div>
          
          <div v-if="serviceInfo.port">
            <p class="text-sm text-gray-500">服务端口</p>
            <p class="text-lg font-semibold text-gray-800">
              {{ serviceInfo.port }}
            </p>
          </div>
        </div>
        
        <!-- 控制按钮 -->
        <div class="flex space-x-3">
          <button
            v-if="serviceStatus !== 'running'"
            @click="handleStart"
            :disabled="loading"
            class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center"
          >
            <i class="fa fa-play mr-2"></i>
            {{ loading ? '启动中...' : '启动服务' }}
          </button>
          
          <button
            v-if="serviceStatus === 'running'"
            @click="handleStop"
            :disabled="loading"
            class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center"
          >
            <i class="fa fa-stop mr-2"></i>
            停止服务
          </button>
          
          <button
            v-if="serviceStatus === 'running'"
            @click="handleRestart"
            :disabled="loading"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center"
          >
            <i class="fa fa-refresh mr-2"></i>
            重启服务
          </button>
        </div>
      </div>
    </div>

    <!-- 资源监控区域 -->
    <div class="grid grid-cols-1 gap-6">
      <!-- 内存/显存使用率 -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">内存使用率</h3>
          <i class="fa fa-memory text-2xl text-blue-600"></i>
        </div>
        
        <div class="text-center mb-4">
          <div class="text-5xl font-bold text-blue-600">
            {{ memoryUsage.percent?.toFixed(1) || 0 }}%
          </div>
        </div>
        
        <!-- 进度条 -->
        <div class="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div
            class="h-3 rounded-full transition-all duration-300"
            :class="getUsageColor(memoryUsage.percent)"
            :style="{ width: (memoryUsage.percent || 0) + '%' }"
          ></div>
        </div>
        
        <!-- 详细信息 -->
        <div class="space-y-2 text-sm text-gray-600">
          <div class="flex justify-between">
            <span>已使用:</span>
            <span class="font-medium">{{ memoryUsage.used_gb?.toFixed(2) || 0 }} GB</span>
          </div>
          <div class="flex justify-between">
            <span>总容量:</span>
            <span class="font-medium">{{ memoryUsage.total_gb?.toFixed(2) || 0 }} GB</span>
          </div>
          <div v-if="memoryUsage.gpu_info" class="pt-2 border-t">
            <div class="flex items-center space-x-2 text-xs text-gray-500">
              <i class="fa fa-info-circle"></i>
              <span>{{ memoryUsage.gpu_info.type }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 硬盘使用率 -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">硬盘使用率</h3>
          <i class="fa fa-hdd-o text-2xl text-green-600"></i>
        </div>
        
        <div class="text-center mb-4">
          <div class="text-5xl font-bold text-green-600">
            {{ diskUsage.percent?.toFixed(1) || 0 }}%
          </div>
        </div>
        
        <!-- 进度条 -->
        <div class="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div
            class="h-3 rounded-full transition-all duration-300"
            :class="getUsageColor(diskUsage.percent, 'green')"
            :style="{ width: (diskUsage.percent || 0) + '%' }"
          ></div>
        </div>
        
        <!-- 详细信息 -->
        <div class="space-y-2 text-sm text-gray-600">
          <div class="flex justify-between">
            <span>已使用:</span>
            <span class="font-medium">{{ diskUsage.used_gb?.toFixed(2) || 0 }} GB</span>
          </div>
          <div class="flex justify-between">
            <span>总容量:</span>
            <span class="font-medium">{{ diskUsage.total_gb?.toFixed(2) || 0 }} GB</span>
          </div>
          <div class="flex justify-between">
            <span>可用空间:</span>
            <span class="font-medium">{{ diskUsage.free_gb?.toFixed(2) || 0 }} GB</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast提示 -->
    <Toast
      :show="toast.show"
      :type="toast.type"
      :message="toast.message"
      @close="toast.show = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSystemStore } from '@/store/system'
import {
  startService,
  stopService,
  restartService
} from '@/api/management'
import { checkInferenceServiceAvailable } from '@/api/inference'
import { formatTime } from '@/utils/format'
import { useLoading } from '@/composables/useLoading'
import Toast from '@/components/Toast.vue'

// 使用system store
const systemStore = useSystemStore()

// 使用全局loading
const { showLoading, hideLoading, updateMessage } = useLoading()

// 从 store 读取数据
const serviceStatus = computed(() => systemStore.serviceStatus)
const serviceInfo = computed(() => systemStore.serviceInfo)
const memoryUsage = computed(() => systemStore.memoryUsage)
const diskUsage = computed(() => systemStore.diskUsage)

const toast = ref({ show: false, type: 'info', message: '' })

// 启动服务
const handleStart = async () => {
  showLoading('正在启动服务...')
  
  try {
    await startService()
    
    // 立即开始智能轮询，无需硬编码等待
    updateMessage('服务启动中，请稍候...')
    let attempts = 0
    const maxAttempts = 30 // 最多等待15秒（500ms * 30）
    
    const checkReady = async () => {
      attempts++
      
      try {
        // 并行检查服务状态和推理服务可用性
        const [_, inferenceReady] = await Promise.all([
          systemStore.updateServiceStatus(),
          systemStore.serviceStatus === 'running' ? checkInferenceServiceAvailable() : Promise.resolve(false)
        ])
        
        if (systemStore.serviceStatus === 'running' && inferenceReady) {
          hideLoading()
          showToast('success', '服务启动成功')
          systemStore.startMonitoring()
          return
        }
        
        if (attempts < maxAttempts) {
          updateMessage(`等待服务就绪... (${attempts}/${maxAttempts})`)
          setTimeout(checkReady, 500) // 500ms轮询间隔
        } else {
          hideLoading()
          showToast('error', '服务启动超时，请检查服务状态')
        }
      } catch (error) {
        if (attempts < maxAttempts) {
          setTimeout(checkReady, 500)
        } else {
          hideLoading()
          showToast('error', '服务启动失败: ' + error.message)
        }
      }
    }
    
    checkReady()
    
  } catch (error) {
    hideLoading()
    showToast('error', '启动服务失败: ' + error.message)
  }
}

// 停止服务
const handleStop = async () => {
  if (!confirm('确定要停止服务吗？')) return
  
  showLoading('正在停止服务...')
  
  try {
    await stopService()
    await systemStore.updateServiceStatus()
    hideLoading()
    systemStore.stopMonitoring()
    showToast('success', '服务已停止')
  } catch (error) {
    hideLoading()
    showToast('error', '停止服务失败: ' + error.message)
  }
}

// 重启服务
const handleRestart = async () => {
  if (!confirm('确定要重启服务吗？')) return
  
  showLoading('正在重启服务...')
  
  try {
    await restartService()
    
    // 立即开始智能轮询，无需硬编码等待
    updateMessage('服务重启中，请稍候...')
    let attempts = 0
    const maxAttempts = 30 // 最多等待15秒
    
    const checkReady = async () => {
      attempts++
      
      try {
        // 并行检查服务状态和推理服务可用性
        const [_, inferenceReady] = await Promise.all([
          systemStore.updateServiceStatus(),
          systemStore.serviceStatus === 'running' ? checkInferenceServiceAvailable() : Promise.resolve(false)
        ])
        
        if (systemStore.serviceStatus === 'running' && inferenceReady) {
          hideLoading()
          showToast('success', '服务重启成功')
          return
        }
        
        if (attempts < maxAttempts) {
          updateMessage(`等待服务就绪... (${attempts}/${maxAttempts})`)
          setTimeout(checkReady, 500)
        } else {
          hideLoading()
          showToast('error', '服务重启超时')
        }
      } catch (error) {
        if (attempts < maxAttempts) {
          setTimeout(checkReady, 500)
        } else {
          hideLoading()
          showToast('error', '服务重启失败: ' + error.message)
        }
      }
    }
    
    checkReady()
    
  } catch (error) {
    hideLoading()
    showToast('error', '重启服务失败: ' + error.message)
  }
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colors = {
    running: 'text-green-600',
    stopped: 'text-gray-600',
    starting: 'text-blue-600',
    error: 'text-red-600'
  }
  return colors[status] || 'text-gray-600'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    running: '运行中',
    stopped: '已停止',
    starting: '启动中',
    error: '错误'
  }
  return texts[status] || status
}

// 获取使用率颜色
const getUsageColor = (percent, color = 'blue') => {
  if (!percent) return `bg-${color}-500`
  
  if (percent > 90) return 'bg-red-500'
  if (percent > 70) return 'bg-yellow-500'
  return `bg-${color}-500`
}

// 显示提示
const showToast = (type, message) => {
  toast.value = { show: true, type, message }
}

onMounted(async () => {
  // 开始监控（即使数据已缓存，也会立即更新）
  systemStore.startMonitoring()
})

onUnmounted(() => {
  // 页面卸载时停止监控，避免后台持续请求
  systemStore.stopMonitoring()
})
</script>
