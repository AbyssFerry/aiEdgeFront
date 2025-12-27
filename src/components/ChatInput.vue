<template>
  <div class="chat-input border-t bg-white p-4">
    <div class="flex space-x-3">
      <textarea
        v-model="inputText"
        @keydown.enter.exact.prevent="handleSend"
        :disabled="disabled"
        placeholder="输入消息... (按 Enter 发送，Shift+Enter 换行)"
        class="flex-1 px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
        rows="3"
      ></textarea>
      
      <button
        @click="handleSend"
        :disabled="disabled || !inputText.trim()"
        class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        <i class="fa fa-paper-plane mr-2"></i>
        发送
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['send'])

const inputText = ref('')

const handleSend = () => {
  if (!inputText.value.trim() || props.disabled) return
  
  emit('send', inputText.value)
  inputText.value = ''
}
</script>

<style scoped>
textarea {
  max-height: 200px;
}
</style>
