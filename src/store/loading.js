import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 全局Loading管理器
 * 支持loading队列，多个loading时显示最新的消息
 */
export const useLoadingStore = defineStore('loading', () => {
  // Loading显示状态
  const show = ref(false)
  
  // Loading消息
  const message = ref('加载中...')
  
  // Loading队列（支持多个loading叠加）
  const queue = ref([])
  
  /**
   * 显示Loading
   * @param {string} msg - Loading提示消息
   */
  const showLoading = (msg = '加载中...') => {
    queue.value.push(msg)
    show.value = true
    message.value = msg
  }
  
  /**
   * 隐藏Loading
   * 如果队列中还有其他loading，则显示上一个
   */
  const hideLoading = () => {
    queue.value.pop()
    
    if (queue.value.length > 0) {
      // 还有其他loading，显示最后一个
      message.value = queue.value[queue.value.length - 1]
    } else {
      // 队列为空，完全关闭loading
      show.value = false
      message.value = '加载中...'
    }
  }
  
  /**
   * 更新当前Loading消息
   * @param {string} msg - 新的消息
   */
  const updateMessage = (msg) => {
    if (queue.value.length > 0) {
      // 更新队列中最后一个消息
      queue.value[queue.value.length - 1] = msg
      message.value = msg
    }
  }
  
  /**
   * 强制清空所有Loading
   * 用于异常情况的重置
   */
  const clearAll = () => {
    queue.value = []
    show.value = false
    message.value = '加载中...'
  }
  
  return {
    show,
    message,
    showLoading,
    hideLoading,
    updateMessage,
    clearAll
  }
})
