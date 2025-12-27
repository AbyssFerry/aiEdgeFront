import { inferenceRequest } from '@/utils/request'
import { createStreamRequest, parseStreamResponse } from '@/utils/stream-parser'

/**
 * 推理服务 API
 */

// 获取模型列表
export function getAvailableModels() {
  return inferenceRequest.get('/v1/models')
}

// 非流式对话
export function chatCompletion(messages, options = {}) {
  return inferenceRequest.post('/v1/chat/completions', {
    messages,
    stream: false,
    ...options
  })
}

// 流式对话
export async function chatCompletionStream(messages, onChunk, onError, options = {}, signal = null) {
  const url = '/api/inference/v1/chat/completions'
  
  try {
    const response = await createStreamRequest(url, messages, {
      stream: true,
      ...options
    }, signal)
    
    const fullContent = await parseStreamResponse(response, onChunk, onError, signal)
    return fullContent
  } catch (error) {
    // 如果是中止错误，不作为异常处理
    if (error.name === 'AbortError') {
      return
    }
    if (onError) {
      onError(error)
    }
    throw error
  }
}

// 检查推理服务是否可用
export async function checkInferenceServiceAvailable() {
  try {
    await getAvailableModels()
    return true
  } catch (error) {
    return false
  }
}
