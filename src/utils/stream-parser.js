/**
 * SSE (Server-Sent Events) 流式数据解析器
 */

/**
 * 解析流式对话响应
 * @param {Response} response - Fetch API响应对象
 * @param {Function} onChunk - 接收到文本块时的回调函数
 * @param {Function} onError - 发生错误时的回调函数
 * @param {AbortSignal} signal - 中止信号
 * @returns {Promise<string>} 完整的响应文本
 */
export async function parseStreamResponse(response, onChunk, onError, signal = null) {
  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  let fullContent = ''

  try {
    while (true) {
      // 检查是否已中止
      if (signal?.aborted) {
        await reader.cancel()
        fullContent += '\n\n[已停止]'
        if (onChunk) {
          onChunk('\n\n[已停止]')
        }
        break
      }

      const { done, value } = await reader.read()
      
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      
      // 保留最后一个不完整的行
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmedLine = line.trim()
        
        if (!trimmedLine) continue
        if (trimmedLine === 'data: [DONE]') continue

        // 移除 "data: " 前缀
        let jsonStr = trimmedLine
        if (trimmedLine.startsWith('data: ')) {
          jsonStr = trimmedLine.slice(6)
        }

        try {
          const data = JSON.parse(jsonStr)
          const content = data.choices?.[0]?.delta?.content
          
          if (content) {
            fullContent += content
            if (onChunk) {
              onChunk(content)
            }
          }
        } catch (err) {
          // 忽略解析错误的行
        }
      }
    }
  } catch (error) {
    // 如果是中止错误，不作为异常处理
    if (error.name === 'AbortError') {
      fullContent += '\n\n[已停止]'
      if (onChunk) {
        onChunk('\n\n[已停止]')
      }
      return fullContent
    }
    if (onError) {
      onError(error)
    }
    throw error
  }

  return fullContent
}

/**
 * 创建流式对话请求
 * @param {string} url - API端点URL
 * @param {Array} messages - 消息列表
 * @param {Object} options - 其他选项
 * @param {AbortSignal} signal - 中止信号
 * @returns {Promise<Response>} Fetch响应对象
 */
export async function createStreamRequest(url, messages, options = {}, signal = null) {
  const {
    model = null,
    temperature = 0.7,
    max_tokens = 2000,
    stream = true,
    ...otherOptions
  } = options

  const payload = {
    messages,
    stream,
    temperature,
    max_tokens,
    ...otherOptions
  }

  if (model) {
    payload.model = model
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload),
    signal: signal  // 添加中止信号
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || error.message || `HTTP ${response.status}`)
  }

  return response
}
