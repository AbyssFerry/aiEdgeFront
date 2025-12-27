/**
 * 文件分片上传辅助函数
 */

const CHUNK_SIZE = 100 * 1024 * 1024 // 100MB

/**
 * 将文件分割为多个分块
 * @param {File} file - 要分割的文件
 * @returns {Array} 分块数组
 */
export function splitFileIntoChunks(file) {
  const chunks = []
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
  
  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE
    const end = Math.min(start + CHUNK_SIZE, file.size)
    chunks.push({
      index: i,
      blob: file.slice(start, end),
      start,
      end,
      size: end - start
    })
  }
  
  return chunks
}

/**
 * 计算总分块数
 * @param {number} fileSize - 文件大小（字节）
 * @returns {number} 分块数
 */
export function calculateTotalChunks(fileSize) {
  return Math.ceil(fileSize / CHUNK_SIZE)
}

/**
 * 创建上传FormData
 * @param {string} taskId - 任务ID
 * @param {number} chunkIndex - 分块索引
 * @param {Blob} chunkBlob - 分块数据
 * @returns {FormData} 表单数据
 */
export function createChunkFormData(taskId, chunkIndex, chunkBlob) {
  const formData = new FormData()
  formData.append('task_id', taskId)
  formData.append('chunk_index', chunkIndex.toString())
  formData.append('file', chunkBlob, `chunk_${chunkIndex}`)
  return formData
}

/**
 * 验证文件类型
 * @param {File} file - 文件对象
 * @returns {boolean} 是否为有效的GGUF文件
 */
export function validateFileType(file) {
  return file.name.toLowerCase().endsWith('.gguf')
}

/**
 * 获取未上传的分块索引
 * @param {number} totalChunks - 总分块数
 * @param {Array<number>} uploadedChunks - 已上传的分块索引数组
 * @returns {Array<number>} 未上传的分块索引数组
 */
export function getPendingChunks(totalChunks, uploadedChunks = []) {
  const allChunks = Array.from({ length: totalChunks }, (_, i) => i)
  return allChunks.filter(index => !uploadedChunks.includes(index))
}

/**
 * 计算上传速度
 * @param {number} uploadedBytes - 已上传字节数
 * @param {number} elapsedSeconds - 已用时间（秒）
 * @returns {number} 上传速度（字节/秒）
 */
export function calculateUploadSpeed(uploadedBytes, elapsedSeconds) {
  if (elapsedSeconds <= 0) return 0
  return uploadedBytes / elapsedSeconds
}

export { CHUNK_SIZE }
