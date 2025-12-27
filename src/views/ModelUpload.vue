<template>
  <div class="model-upload space-y-6">
    <!-- 上传区域 -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">上传模型</h2>
      
      <!-- 拖拽上传区 -->
      <div
        @drop.prevent="handleDrop"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        class="border-2 border-dashed rounded-lg p-12 text-center transition-all"
        :class="isDragging ? 'border-primary bg-blue-50' : 'border-gray-300 hover:border-gray-400'"
      >
        <div class="flex flex-col items-center space-y-4">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <i class="fa fa-cloud-upload text-3xl text-primary"></i>
          </div>
          
          <div>
            <p class="text-lg font-medium text-gray-700 mb-2">
              拖拽文件到此处，或
              <label class="text-primary cursor-pointer hover:underline">
                点击选择文件
                <input
                  type="file"
                  @change="handleFileSelect"
                  accept=".gguf"
                  class="hidden"
                />
              </label>
            </p>
            <p class="text-sm text-gray-500">
              仅支持 .gguf 格式文件，支持断点续传
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 当前上传任务 -->
    <div v-if="currentUpload" class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">上传进度</h3>
      
      <div class="space-y-4">
        <div class="flex items-start justify-between">
          <div class="flex items-center space-x-3">
            <i class="fa fa-file-archive-o text-2xl text-blue-600"></i>
            <div>
              <p class="font-medium text-gray-800">{{ currentUpload.filename }}</p>
              <p class="text-sm text-gray-500">
                {{ formatFileSize(currentUpload.fileSize) }}
              </p>
            </div>
          </div>
          
          <div class="text-right">
            <div class="text-2xl font-bold text-primary">
              {{ currentUpload.percentage.toFixed(1) }}%
            </div>
            <div class="text-sm text-gray-500">
              {{ currentUpload.uploadedChunks }} / {{ currentUpload.totalChunks }} 块
            </div>
          </div>
        </div>
        
        <!-- 进度条 -->
        <div class="w-full bg-gray-200 rounded-full h-3">
          <div
            class="bg-primary h-3 rounded-full transition-all duration-300"
            :style="{ width: currentUpload.percentage + '%' }"
          ></div>
        </div>
        
        <!-- 详细信息 -->
        <div class="flex items-center justify-between text-sm text-gray-600">
          <div class="flex items-center space-x-4">
            <span>
              <i class="fa fa-upload mr-1"></i>
              已上传: {{ formatFileSize(currentUpload.uploadedBytes) }}
            </span>
            <span v-if="currentUpload.speed > 0">
              <i class="fa fa-tachometer mr-1"></i>
              {{ formatFileSize(currentUpload.speed) }}/s
            </span>
          </div>
          <div v-if="currentUpload.remainingTime">
            <i class="fa fa-clock-o mr-1"></i>
            剩余时间: {{ currentUpload.remainingTime }}
          </div>
        </div>
        
        <!-- 控制按钮 -->
        <div class="flex space-x-3">
          <button
            v-if="currentUpload.status === 'uploading'"
            @click="pauseUpload"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <i class="fa fa-pause mr-2"></i>暂停
          </button>
          <button
            v-if="currentUpload.status === 'paused'"
            @click="resumeUpload"
            class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition"
          >
            <i class="fa fa-play mr-2"></i>继续
          </button>
          <button
            @click="cancelUpload"
            class="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
          >
            <i class="fa fa-times mr-2"></i>取消
          </button>
        </div>
        
        <!-- 状态消息 -->
        <div v-if="currentUpload.error" class="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <i class="fa fa-exclamation-circle mr-2"></i>
          {{ currentUpload.error }}
        </div>
      </div>
    </div>

    <!-- 上传历史 -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">上传历史</h3>
      
      <!-- 空状态 -->
      <div v-if="uploadHistory.length === 0" class="text-center py-12">
        <i class="fa fa-history text-4xl text-gray-400 mb-4"></i>
        <p class="text-gray-600">暂无上传历史</p>
      </div>
      
      <!-- 历史列表 -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b bg-gray-50">
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">文件名</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">大小</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">上传时间</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="(item, index) in uploadHistory" :key="index" class="hover:bg-gray-50">
              <td class="px-4 py-3 text-sm text-gray-900">{{ item.filename }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">
                {{ formatFileSize(item.fileSize) }}
              </td>
              <td class="px-4 py-3">
                <span
                  class="px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getStatusBadgeClass(item.status)"
                >
                  {{ getStatusText(item.status) }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-500">
                {{ formatTime(item.time) }}
              </td>
              <td class="px-4 py-3 text-sm">
                <button
                  v-if="item.status === 'paused'"
                  @click="continueUpload(item)"
                  class="text-primary hover:underline mr-3"
                >
                  继续上传
                </button>
                <button class="text-gray-600 hover:underline">
                  查看详情
                </button>
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
import { ref, computed } from 'vue'
import { useSystemStore } from '@/store/system'
import { initUpload, uploadChunk, completeUpload, getUploadProgress } from '@/api/management'
import {
  splitFileIntoChunks,
  calculateTotalChunks,
  createChunkFormData,
  validateFileType,
  calculateUploadSpeed
} from '@/utils/upload-helper'
import { formatFileSize, formatTime, calculateRemainingTime } from '@/utils/format'
import Toast from '@/components/Toast.vue'

const systemStore = useSystemStore()
const isDragging = ref(false)
const currentUpload = ref(null)
const uploadHistory = ref([])
const toast = ref({ show: false, type: 'info', message: '' })

// 处理拖拽
const handleDrop = (e) => {
  isDragging.value = false
  const files = Array.from(e.dataTransfer.files)
  
  if (files.length > 0) {
    handleFile(files[0])
  }
}

// 处理文件选择
const handleFileSelect = (e) => {
  const files = Array.from(e.target.files)
  if (files.length > 0) {
    handleFile(files[0])
  }
  // 清空input，以便可以重新选择同一文件
  e.target.value = ''
}

// 处理文件
const handleFile = async (file) => {
  // 验证文件类型
  if (!validateFileType(file)) {
    showToast('error', '仅支持 .gguf 格式文件')
    return
  }
  
  // 检查是否有正在上传的任务
  if (currentUpload.value && currentUpload.value.status === 'uploading') {
    showToast('warning', '请等待当前上传完成')
    return
  }
  
  try {
    // 初始化上传
    const totalChunks = calculateTotalChunks(file.size)
    const response = await initUpload(file.name, file.size, totalChunks)
    
    if (response.success) {
      currentUpload.value = {
        taskId: response.task_id,
        file: file,
        filename: file.name,
        fileSize: file.size,
        totalChunks: totalChunks,
        uploadedChunks: response.uploaded_chunks?.length || 0,
        uploadedBytes: (response.uploaded_chunks?.length || 0) * 100 * 1024 * 1024,
        percentage: ((response.uploaded_chunks?.length || 0) / totalChunks) * 100,
        status: 'uploading',
        startTime: Date.now(),
        speed: 0,
        remainingTime: null,
        error: null,
        uploadedChunkIndexes: response.uploaded_chunks || []
      }
      
      // 开始上传
      await startUpload()
    }
  } catch (error) {
    showToast('error', '初始化上传失败: ' + error.message)
  }
}

// 开始上传
const startUpload = async () => {
  if (!currentUpload.value) return
  
  const chunks = splitFileIntoChunks(currentUpload.value.file)
  const uploadedIndexes = new Set(currentUpload.value.uploadedChunkIndexes)
  
  currentUpload.value.status = 'uploading'
  
  for (const chunk of chunks) {
    // 检查是否暂停或取消
    if (currentUpload.value.status !== 'uploading') {
      break
    }
    
    // 跳过已上传的分块
    if (uploadedIndexes.has(chunk.index)) {
      continue
    }
    
    try {
      const formData = createChunkFormData(
        currentUpload.value.taskId,
        chunk.index,
        chunk.blob
      )
      
      await uploadChunk(formData)
      
      // 更新进度
      currentUpload.value.uploadedChunks++
      currentUpload.value.uploadedBytes += chunk.size
      currentUpload.value.percentage = (currentUpload.value.uploadedChunks / currentUpload.value.totalChunks) * 100
      
      // 计算速度和剩余时间
      const elapsedSeconds = (Date.now() - currentUpload.value.startTime) / 1000
      currentUpload.value.speed = calculateUploadSpeed(currentUpload.value.uploadedBytes, elapsedSeconds)
      currentUpload.value.remainingTime = calculateRemainingTime(
        currentUpload.value.uploadedBytes,
        currentUpload.value.fileSize,
        currentUpload.value.speed
      )
      
    } catch (error) {
      currentUpload.value.error = `上传失败: ${error.message}`
      currentUpload.value.status = 'error'
      showToast('error', '上传失败: ' + error.message)
      return
    }
  }
  
  // 如果完成上传，合并文件
  if (currentUpload.value.status === 'uploading' && currentUpload.value.uploadedChunks === currentUpload.value.totalChunks) {
    await finishUpload()
  }
}

// 完成上传
const finishUpload = async () => {
  try {
    currentUpload.value.status = 'merging'
    showToast('info', '正在合并文件...')
    
    await completeUpload(currentUpload.value.taskId)
    
    currentUpload.value.status = 'completed'
    showToast('success', '模型上传成功')
    
    // 更新store中的模型列表
    await systemStore.updateModelList()
    
    // 添加到历史
    uploadHistory.value.unshift({
      filename: currentUpload.value.filename,
      fileSize: currentUpload.value.fileSize,
      status: 'completed',
      time: new Date().toISOString()
    })
    
    // 清空当前任务
    setTimeout(() => {
      currentUpload.value = null
    }, 3000)
    
  } catch (error) {
    currentUpload.value.error = '合并文件失败: ' + error.message
    currentUpload.value.status = 'error'
    showToast('error', '合并文件失败: ' + error.message)
  }
}

// 暂停上传
const pauseUpload = () => {
  if (currentUpload.value) {
    currentUpload.value.status = 'paused'
    
    // 添加到历史
    uploadHistory.value.unshift({
      ...currentUpload.value,
      status: 'paused',
      time: new Date().toISOString()
    })
    
    showToast('info', '上传已暂停')
  }
}

// 继续上传
const resumeUpload = () => {
  if (currentUpload.value) {
    currentUpload.value.status = 'uploading'
    currentUpload.value.startTime = Date.now()
    startUpload()
  }
}

// 继续历史中的上传
const continueUpload = async (item) => {
  // TODO: 实现从历史恢复上传
  showToast('info', '功能开发中...')
}

// 取消上传
const cancelUpload = () => {
  if (currentUpload.value) {
    currentUpload.value.status = 'cancelled'
    
    // 添加到历史
    uploadHistory.value.unshift({
      filename: currentUpload.value.filename,
      fileSize: currentUpload.value.fileSize,
      status: 'cancelled',
      time: new Date().toISOString()
    })
    
    currentUpload.value = null
    showToast('info', '上传已取消')
  }
}

// 获取状态徽章样式
const getStatusBadgeClass = (status) => {
  const classes = {
    completed: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
  }
  return classes[status] || 'bg-blue-100 text-blue-800'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    uploading: '上传中',
    paused: '已暂停',
    completed: '已完成',
    error: '失败',
    cancelled: '已取消',
    merging: '合并中'
  }
  return texts[status] || status
}

// 显示提示
const showToast = (type, message) => {
  toast.value = { show: true, type, message }
}
</script>
