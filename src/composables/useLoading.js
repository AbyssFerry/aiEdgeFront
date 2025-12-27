import { useLoadingStore } from '@/store/loading'

/**
 * 全局Loading Composable
 * 提供简洁的loading操作API
 * 
 * @example
 * const { showLoading, hideLoading, updateMessage } = useLoading()
 * 
 * showLoading('正在处理...')
 * // ... 执行异步操作
 * updateMessage('处理中，请稍候...')
 * // ... 继续处理
 * hideLoading()
 */
export const useLoading = () => {
  const loadingStore = useLoadingStore()
  
  return {
    /**
     * 显示Loading
     * @param {string} message - Loading提示消息
     */
    showLoading: loadingStore.showLoading,
    
    /**
     * 隐藏Loading
     */
    hideLoading: loadingStore.hideLoading,
    
    /**
     * 更新Loading消息
     * @param {string} message - 新的消息
     */
    updateMessage: loadingStore.updateMessage,
    
    /**
     * 清空所有Loading（用于异常处理）
     */
    clearAll: loadingStore.clearAll
  }
}

/**
 * 使用Loading包装Promise
 * @param {Function} asyncFn - 异步函数
 * @param {string} message - Loading提示消息
 * @returns {Promise} 返回异步函数的结果
 * 
 * @example
 * const result = await withLoading(fetchData(), '正在加载数据...')
 */
export const withLoading = async (asyncFn, message = '加载中...') => {
  const { showLoading, hideLoading } = useLoading()
  
  showLoading(message)
  try {
    const result = await asyncFn
    return result
  } finally {
    hideLoading()
  }
}
