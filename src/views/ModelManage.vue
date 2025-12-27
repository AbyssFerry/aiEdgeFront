<template>
  <div class="model-manage bg-white rounded-lg shadow p-6">
    <!-- 顶部工具栏 -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center space-x-4">
        <h2 class="text-2xl font-bold text-gray-800">模型管理</h2>
        <div class="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
          <i class="fa fa-info-circle mr-1"></i>
          启动服务后所有模型自动激活
        </div>
        <button
          @click="loadModels"
          :disabled="isRefreshing"
          class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center"
        >
          <i class="fa fa-refresh mr-2" :class="{ 'fa-spin': isRefreshing }"></i>
          刷新列表
        </button>
      </div>
      
      <!-- 搜索框 -->
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索模型..."
          class="w-64 pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <i class="fa fa-search absolute left-3 top-3 text-gray-400"></i>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredModels.length === 0 && !searchQuery" class="text-center py-20">
      <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="fa fa-database text-4xl text-gray-400"></i>
      </div>
      <h3 class="text-xl font-semibold text-gray-700 mb-2">暂无模型</h3>
      <p class="text-gray-500 mb-2">服务器上还没有任何模型文件</p>
      <p class="text-gray-500 mb-6">请前往下载或上传页面添加模型文件</p>
      <div class="flex justify-center space-x-4">
        <router-link to="/download" class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition">
          <i class="fa fa-cloud-download mr-2"></i>下载模型
        </router-link>
        <router-link to="/upload" class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
          <i class="fa fa-cloud-upload mr-2"></i>上传模型
        </router-link>
      </div>
    </div>

    <!-- 搜索无结果 -->
    <div v-else-if="filteredModels.length === 0" class="text-center py-20">
      <i class="fa fa-search text-4xl text-gray-400 mb-4"></i>
      <p class="text-gray-600">未找到匹配的模型</p>
    </div>

    <!-- 模型列表表格 -->
    <div v-else class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b bg-gray-50">
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">模型名称</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">文件名</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">文件大小</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(model, index) in filteredModels" :key="index" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <i class="fa fa-cube text-blue-600"></i>
                </div>
                <div class="text-sm font-medium text-gray-900">{{ model.name }}</div>
              </div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">
              {{ getFileName(model.path) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatSize(model.size) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                <i class="fa fa-check-circle mr-1"></i>已加载
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                @click="handleDelete(model)"
                class="text-red-600 hover:text-red-900 transition"
                title="删除模型"
              >
                <i class="fa fa-trash-o mr-1"></i>删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 删除确认弹窗 -->
    <Teleport to="body">
      <div v-if="showDeleteDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">确认删除</h3>
          <p class="text-gray-600 mb-6">
            确定要删除模型 <span class="font-medium text-gray-900">{{ modelToDelete?.name }}</span> 吗？此操作不可恢复。
          </p>
          <div class="flex justify-end space-x-3">
            <button
              @click="showDeleteDialog = false"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              取消
            </button>
            <button
              @click="confirmDelete"
              :disabled="deleting"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              <span v-if="deleting">删除中...</span>
              <span v-else>确认删除</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

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
import { ref, computed, onMounted, onActivated } from 'vue'
import { useSystemStore } from '@/store/system'
import { deleteModel } from '@/api/management'
import { formatFileSize } from '@/utils/format'
import { useLoading } from '@/composables/useLoading'
import Toast from '@/components/Toast.vue'

// 使用system store
const systemStore = useSystemStore()

// 使用全局Loading
const { showLoading, hideLoading } = useLoading()

// 从stroe读取模型列表
const models = computed(() => systemStore.models)

const searchQuery = ref('')
const showDeleteDialog = ref(false)
const modelToDelete = ref(null)
const deleting = ref(false)
const toast = ref({ show: false, type: 'info', message: '' })

// 防抖控制
const isRefreshing = ref(false)
let refreshTimer = null

// 过滤后的模型列表
const filteredModels = computed(() => {
  const modelList = models.value || []
  if (!searchQuery.value) return modelList
  
  const query = searchQuery.value.toLowerCase()
  return modelList.filter(model => 
    model.name.toLowerCase().includes(query)
  )
})

// 加载模型列表（直接从stroe更新）
// 添加500ms防抖，避免用户快速点击
const loadModels = async () => {
  // 防抖检查
  if (isRefreshing.value) {
    return
  }
  
  isRefreshing.value = true
  showLoading('正在从服务器加载模型列表...')
  
  try {
    await systemStore.updateModelList()
    
    const modelCount = (models.value || []).length
    if (modelCount > 0) {
      showToast('success', `成功加载 ${modelCount} 个模型`)
    } else {
      showToast('info', '服务器上暂无模型')
    }
  } catch (error) {
    showToast('error', '加载模型列表失败: ' + error.message)
  } finally {
    hideLoading()
    
    // 500ms后解除防抖锁
    if (refreshTimer) {
      clearTimeout(refreshTimer)
    }
    refreshTimer = setTimeout(() => {
      isRefreshing.value = false
    }, 500)
  }
}

// 处理删除
const handleDelete = (model) => {
  modelToDelete.value = model
  showDeleteDialog.value = true
}

// 确认删除
const confirmDelete = async () => {
  if (!modelToDelete.value) return
  
  deleting.value = true
  try {
    await deleteModel(modelToDelete.value.name)
    showToast('success', '模型删除成功')
    showDeleteDialog.value = false
    modelToDelete.value = null
    
    // 重新加载列表
    await systemStore.updateModelList()
  } catch (error) {
    showToast('error', '删除模型失败: ' + error.message)
  } finally {
    deleting.value = false
  }
}

// 从路径中提取文件名
const getFileName = (path) => {
  if (!path) return ''
  return path.split('/').pop() || path.split('\\').pop() || path
}

// 格式化文件大小（GB或MB）
const formatSize = (bytes) => {
  if (!bytes) return '0 B'
  
  const gb = bytes / (1024 * 1024 * 1024)
  if (gb >= 1) {
    return gb.toFixed(2) + ' GB'
  }
  
  const mb = bytes / (1024 * 1024)
  return mb.toFixed(2) + ' MB'
}

// 显示提示
const showToast = (type, message) => {
  toast.value = { show: true, type, message }
}

onMounted(() => {
  // 强制触发一次loadModels确保有数据
  if (!models.value || models.value.length === 0) {
    loadModels()
  }
})

// 每次组件激活时也重新加载模型（从其他页面返回时）
onActivated(() => {
})
</script>

<style scoped>
/* 样式已移除，使用全局Loading组件 */
</style>
