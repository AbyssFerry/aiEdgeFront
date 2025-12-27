<template>
  <div class="message-list overflow-y-auto p-6 space-y-4" ref="messageContainer">
    <div
      v-for="(message, index) in messages"
      :key="index"
      class="message-item flex"
      :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
    >
      <!-- AI消息 -->
      <div v-if="message.role === 'assistant'" class="flex items-start space-x-3 max-w-3xl">
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
          <i class="fa fa-robot text-white text-sm"></i>
        </div>
        <div class="flex-1">
          <div class="bg-white border rounded-lg p-4 shadow-sm">
            <!-- 如果内容为空，显示typing动画；否则显示内容 -->
            <div v-if="!message.content" class="flex space-x-1">
              <div class="typing-dot w-2 h-2 bg-gray-400 rounded-full"></div>
              <div class="typing-dot w-2 h-2 bg-gray-400 rounded-full"></div>
              <div class="typing-dot w-2 h-2 bg-gray-400 rounded-full"></div>
            </div>
            <div v-else class="text-gray-800 whitespace-pre-wrap" v-html="formatContent(message.content)"></div>
          </div>
          <div class="text-xs text-gray-400 mt-1 ml-2">
            {{ formatTime(message.timestamp) }}
          </div>
        </div>
      </div>

      <!-- 用户消息 -->
      <div v-else class="flex items-start space-x-3 max-w-3xl">
        <div class="flex-1">
          <div class="bg-primary text-white rounded-lg p-4 shadow-sm">
            <div class="whitespace-pre-wrap">{{ message.content }}</div>
          </div>
          <div class="text-xs text-gray-400 mt-1 mr-2 text-right">
            {{ formatTime(message.timestamp) }}
          </div>
        </div>
        <div class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
          <i class="fa fa-user text-gray-600 text-sm"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { formatTime as formatTimeUtil } from '@/utils/format'

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  }
})

const messageContainer = ref(null)

// 格式化时间
const formatTime = (timestamp) => {
  return formatTimeUtil(timestamp, 'HH:mm:ss')
}

// 格式化内容（支持简单的换行）
const formatContent = (content) => {
  if (!content) return ''
  return content.replace(/\n/g, '<br>')
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
  })
}

// 监听消息变化，自动滚动
watch(() => props.messages, () => {
  scrollToBottom()
}, { deep: true, flush: 'post' })
</script>

<style scoped>
.message-list {
  background: linear-gradient(to bottom, #f8fafc 0%, #e5e7eb 100%);
}
</style>
