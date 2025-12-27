<template>
  <div class="model-download space-y-6">
    <!-- 下载表单 -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">下载模型</h2>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            模型仓库 ID
            <span class="text-gray-500 font-normal">（如: TheBloke/Llama-2-7B-GGUF）</span>
          </label>
          <input
            v-model="downloadForm.repoId"
            type="text"
            placeholder="TheBloke/Llama-2-7B-GGUF"
            class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            文件名
            <span class="text-gray-500 font-normal">（如: llama-2-7b.Q4_K_M.gguf）</span>
          </label>
          <input
            v-model="downloadForm.filename"
            type="text"
            placeholder="llama-2-7b.Q4_K_M.gguf"
            class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <button
          @click="startDownload"
          :disabled="!canStartDownload"
          class="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <i class="fa fa-download mr-2"></i>
          开始下载
        </button>
      </div>
    </div>

    <!-- 当前下载任务 -->
    <div v-if="currentTask" class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">当前下载</h3>
      
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <i class="fa fa-file-archive-o text-2xl text-blue-600"></i>
              <div>
                <p class="font-medium text-gray-800">{{ currentTask.filename }}</p>
                <p class="text-sm text-gray-500">{{ currentTask.repoId }}</p>
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-2xl font-bold" :class="getStatusColor(currentTask.status)">
              {{ currentTask.percentage.toFixed(1) }}%
            </div>
            <div class="text-sm text-gray-500">
              {{ currentTask.current_str }} / {{ currentTask.total_str }}
            </div>
          </div>
        </div>
        
        <!-- 进度条 -->
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div
            class="h-2.5 rounded-full transition-all duration-300"
            :class="getProgressBarClass(currentTask.status)"
            :style="{ width: currentTask.percentage + '%' }"
          ></div>
        </div>
        
        <!-- 状态消息 -->
        <div class="flex items-center justify-between text-sm">
          <span :class="getStatusColor(currentTask.status)">
            <i :class="getStatusIcon(currentTask.status)" class="mr-1"></i>
            {{ currentTask.message }}
          </span>
          <span v-if="currentTask.error" class="text-red-600">
            {{ currentTask.error }}
          </span>
        </div>
      </div>
    </div>

    <!-- 下载历史 -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">下载历史</h3>
      
      <!-- 空状态 -->
      <div v-if="downloadHistory.length === 0" class="text-center py-12">
        <i class="fa fa-history text-4xl text-gray-400 mb-4"></i>
        <p class="text-gray-600">暂无下载历史</p>
      </div>
      
      <!-- 历史列表 -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b bg-gray-50">
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">模型仓库</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">文件名</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">进度</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="(item, index) in downloadHistory" :key="index" class="hover:bg-gray-50">
              <td class="px-4 py-3 text-sm text-gray-900">{{ item.repoId }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ item.filename }}</td>
              <td class="px-4 py-3">
                <span
                  class="px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getStatusBadgeClass(item.status)"
                >
                  {{ getStatusText(item.status) }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600">
                {{ item.percentage?.toFixed(1) || 0 }}%
              </td>
              <td class="px-4 py-3 text-sm text-gray-500">
                {{ formatTime(item.time) }}
              </td>
            </tr>
          </tbody>
        </table>
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
import { ref, computed, onUnmounted } from 'vue'
import { startModelDownload, getDownloadStatus } from '@/api/management'
import { formatTime } from '@/utils/format'
import Toast from '@/components/Toast.vue'

const downloadForm = ref({
  repoId: '',
  filename: ''
})

const currentTask = ref(null)
const downloadHistory = ref([])
const toast = ref({ show: false, type: 'info', message: '' })
let pollInterval = null

// 是否可以开始下载
const canStartDownload = computed(() => {
  return downloadForm.value.repoId.trim() && downloadForm.value.filename.trim() && !currentTask.value
})

// 开始下载
const startDownload = async () => {
  try {
    const response = await startModelDownload(
      downloadForm.value.repoId,
      downloadForm.value.filename
    )
    
    if (response.success) {
      currentTask.value = {
        taskId: response.task_id,
        repoId: downloadForm.value.repoId,
        filename: downloadForm.value.filename,
        status: 'starting',
        percentage: 0,
        current_str: '0B',
        total_str: '0B',
        message: '正在启动下载...',
        error: null
      }
      
      showToast('success', '下载任务已启动')
      
      // 清空表单
      downloadForm.value.repoId = ''
      downloadForm.value.filename = ''
      
      // 开始轮询进度
      startPolling()
    }
  } catch (error) {
    showToast('error', '启动下载失败: ' + error.message)
  }
}

// 开始轮询进度
const startPolling = () => {
  if (pollInterval) {
    clearInterval(pollInterval)
  }
  
  pollInterval = setInterval(async () => {
    if (!currentTask.value) {
      stopPolling()
      return
    }
    
    try {
      const status = await getDownloadStatus(currentTask.value.taskId)
      
      currentTask.value.status = status.status
      currentTask.value.percentage = status.percentage || 0
      currentTask.value.current_str = status.current_str || '0B'
      currentTask.value.total_str = status.total_str || '0B'
      currentTask.value.message = status.message || ''
      currentTask.value.error = status.error || null
      
      // 如果完成或失败，停止轮询并添加到历史
      if (status.status === 'completed' || status.status === 'failed') {
        stopPolling()
        
        downloadHistory.value.unshift({
          ...currentTask.value,
          time: new Date().toISOString()
        })
        
        if (status.status === 'completed') {
          showToast('success', '模型下载完成')
        } else {
          showToast('error', '模型下载失败: ' + (status.error || '未知错误'))
        }
        
        currentTask.value = null
      }
    } catch (error) {
      // 静默处理错误
    }
  }, 1000) // 每秒查询一次
}

// 停止轮询
const stopPolling = () => {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colors = {
    starting: 'text-blue-600',
    downloading: 'text-blue-600',
    completed: 'text-green-600',
    failed: 'text-red-600',
    not_found: 'text-gray-600'
  }
  return colors[status] || 'text-gray-600'
}

// 获取进度条样式
const getProgressBarClass = (status) => {
  const classes = {
    starting: 'bg-blue-500',
    downloading: 'bg-blue-500',
    completed: 'bg-green-500',
    failed: 'bg-red-500'
  }
  return classes[status] || 'bg-gray-500'
}

// 获取状态图标
const getStatusIcon = (status) => {
  const icons = {
    starting: 'fa fa-spinner fa-spin',
    downloading: 'fa fa-download',
    completed: 'fa fa-check-circle',
    failed: 'fa fa-times-circle'
  }
  return icons[status] || 'fa fa-question-circle'
}

// 获取状态徽章样式
const getStatusBadgeClass = (status) => {
  const classes = {
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    downloading: 'bg-blue-100 text-blue-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    starting: '启动中',
    downloading: '下载中',
    completed: '已完成',
    failed: '失败',
    not_found: '未找到'
  }
  return texts[status] || status
}

// 显示提示
const showToast = (type, message) => {
  toast.value = { show: true, type, message }
}

// 清理
onUnmounted(() => {
  stopPolling()
})
</script>
