import { managementRequest } from '@/utils/request'

/**
 * 模型管理 API
 */

// 获取所有模型列表
export function getModelList() {
  return managementRequest.get('/models/list')
}

// 删除模型
export function deleteModel(modelName) {
  return managementRequest.delete('/models/delete', {
    data: { model_name: modelName }
  })
}

// 启动模型下载
export function startModelDownload(repoId, filename) {
  return managementRequest.post('/models/download/start', {
    repo_id: repoId,
    filename: filename
  })
}

// 查询下载进度
export function getDownloadStatus(taskId) {
  return managementRequest.get(`/models/download/status/${taskId}`)
}

/**
 * 服务控制 API
 */

// 启动推理服务
export function startService() {
  return managementRequest.post('/service/start')
}

// 停止推理服务
export function stopService() {
  return managementRequest.post('/service/stop')
}

// 重启推理服务
export function restartService() {
  return managementRequest.post('/service/restart')
}

// 获取服务状态
export function getServiceStatus() {
  return managementRequest.get('/service/status')
}

/**
 * 分片上传 API
 */

// 初始化上传会话
export function initUpload(filename, fileSize, totalChunks) {
  return managementRequest.post('/upload/init', {
    filename,
    file_size: fileSize,
    total_chunks: totalChunks
  })
}

// 上传单个分块
export function uploadChunk(formData) {
  return managementRequest.post('/upload/chunk', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 300000 // 5分钟超时
  })
}

// 查询上传进度
export function getUploadProgress(taskId) {
  return managementRequest.get(`/upload/progress/${taskId}`)
}

// 完成上传
export function completeUpload(taskId) {
  return managementRequest.post('/upload/complete', 
    new URLSearchParams({ task_id: taskId }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  )
}

/**
 * 系统信息 API
 */

// 查询硬盘使用情况
export function getDiskUsage() {
  return managementRequest.get('/system/disk')
}

// 查询内存使用情况
export function getMemoryUsage() {
  return managementRequest.get('/system/memory')
}

/**
 * 健康检查 API
 */

// 健康检查
export function healthCheck() {
  return managementRequest.get('/health')
}
