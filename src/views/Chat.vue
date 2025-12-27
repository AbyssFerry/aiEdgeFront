<template>
  <div class="chat-container h-full flex flex-col bg-white rounded-lg shadow">
    <!-- 聊天界面 -->
    <div class="flex-1 flex flex-col">
      <!-- 顶部工具栏 -->
      <div class="chat-header flex items-center justify-between px-6 py-4 border-b">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <i class="fa fa-comments text-white text-lg"></i>
          </div>
          <div>
            <h3 class="font-semibold text-gray-800">AI 助手</h3>
            <p class="text-xs text-gray-500">{{ selectedModel || '默认模型' }}</p>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <!-- 模型选择 -->
          <select
            v-model="selectedModel"
            class="px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            @change="onModelChange"
          >
            <option value="">选择模型</option>
            <option v-for="model in availableModels" :key="model.id" :value="model.id">
              {{ model.id }}
            </option>
          </select>
          
          <!-- 清空对话 -->
          <button
            @click="clearMessages"
            class="px-4 py-2 text-gray-600 hover:text-gray-800 border rounded-lg hover:bg-gray-50 transition text-sm"
            title="清空对话"
          >
            <i class="fa fa-trash-o mr-2"></i>清空
          </button>
        </div>
      </div>

      <!-- 消息列表 -->
      <MessageList
        :messages="messages"
        class="flex-1"
      />

      <!-- 输入框 -->
      <ChatInput
        :disabled="isTyping"
        @send="handleSendMessage"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated } from 'vue'
import { getAvailableModels, chatCompletionStream, checkInferenceServiceAvailable } from '@/api/inference'
import MessageList from '@/components/MessageList.vue'
import ChatInput from '@/components/ChatInput.vue'

const availableModels = ref([])
const selectedModel = ref('')
const messages = ref([])
const isTyping = ref(false)

// 加载可用模型
const loadModels = async () => {
  try {
    const response = await getAvailableModels()
    availableModels.value = response.data || []
    
    // 默认选择第一个模型
    if (availableModels.value.length > 0 && !selectedModel.value) {
      selectedModel.value = availableModels.value[0].id
    }
  } catch (error) {
    // 静默处理错误
  }
}

// 模型切换时清空对话
const onModelChange = () => {
  if (messages.value.length > 0) {
    if (confirm('切换模型将清空当前对话，是否继续？')) {
      clearMessages()
    } else {
      // 恢复之前的选择
      selectedModel.value = messages.value[0]?.model || availableModels.value[0]?.id
    }
  }
}

// 清空消息
const clearMessages = () => {
  messages.value = []
}

// 发送消息
const handleSendMessage = async (content) => {
  if (!content.trim() || isTyping.value) return

  // 检查服务是否可用
  try {
    const serviceAvailable = await checkInferenceServiceAvailable()
    if (!serviceAvailable) {
      alert('推理服务未启动，请先到服务控制页面启动服务！')
      return
    }
  } catch (error) {
    alert('无法连接到推理服务，请确保服务已启动！')
    return
  }

  // 添加用户消息
  const userMessage = {
    role: 'user',
    content: content.trim(),
    timestamp: new Date().toISOString()
  }
  messages.value.push(userMessage)

  // 准备AI消息
  const aiMessage = {
    role: 'assistant',
    content: '',
    timestamp: new Date().toISOString()
  }
  const aiMessageIndex = messages.value.length
  messages.value.push(aiMessage)

  isTyping.value = true

  try {
    // 构建对话历史（只发送role和content）
    const conversationHistory = messages.value
      .slice(0, -1) // 排除刚添加的空AI消息
      .map(msg => ({ role: msg.role, content: msg.content }))

    // 流式获取回复
    await chatCompletionStream(
      conversationHistory,
      (chunk) => {
        // 逐字添加内容
        messages.value[aiMessageIndex].content += chunk
        // 强制触发响应式更新
        messages.value = [...messages.value]
      },
      (error) => {
        messages.value[aiMessageIndex].content = '抱歉，发生了错误：' + error.message
      },
      {
        model: selectedModel.value || undefined
      }
    )
  } catch (error) {
    aiMessage.content = '抱歉，发生了错误：' + error.message
  } finally {
    isTyping.value = false
  }
}

onMounted(() => {
  loadModels()
})

// 每次进入页面时重新加载模型
onActivated(() => {
  loadModels()
})
</script>

<style scoped>
.chat-container {
  max-height: calc(100vh - 136px);
}
</style>
