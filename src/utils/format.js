import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(duration)
dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @param {number} decimals - 小数位数
 * @returns {string} 格式化后的字符串
 */
export function formatFileSize(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes'
  if (!bytes) return '-'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * 格式化百分比
 * @param {number} value - 百分比数值 (0-100)
 * @param {number} decimals - 小数位数
 * @returns {string} 格式化后的百分比字符串
 */
export function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined) return '-'
  return value.toFixed(decimals) + '%'
}

/**
 * 格式化时间
 * @param {string|Date} time - 时间
 * @param {string} format - 格式
 * @returns {string} 格式化后的时间字符串
 */
export function formatTime(time, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!time) return '-'
  return dayjs(time).format(format)
}

/**
 * 格式化相对时间
 * @param {string|Date} time - 时间
 * @returns {string} 相对时间字符串
 */
export function formatRelativeTime(time) {
  if (!time) return '-'
  return dayjs(time).fromNow()
}

/**
 * 格式化持续时间
 * @param {number} seconds - 秒数
 * @returns {string} 格式化后的持续时间
 */
export function formatDuration(seconds) {
  if (!seconds || seconds < 0) return '-'
  
  const dur = dayjs.duration(seconds, 'seconds')
  const days = Math.floor(dur.asDays())
  const hours = dur.hours()
  const minutes = dur.minutes()
  const secs = dur.seconds()

  const parts = []
  if (days > 0) parts.push(`${days}天`)
  if (hours > 0) parts.push(`${hours}小时`)
  if (minutes > 0) parts.push(`${minutes}分钟`)
  if (secs > 0 || parts.length === 0) parts.push(`${secs}秒`)

  return parts.join(' ')
}

/**
 * 计算剩余时间
 * @param {number} current - 当前进度 (字节)
 * @param {number} total - 总大小 (字节)
 * @param {number} speed - 速度 (字节/秒)
 * @returns {string} 剩余时间字符串
 */
export function calculateRemainingTime(current, total, speed) {
  if (!speed || speed <= 0 || current >= total) return '-'
  
  const remaining = total - current
  const seconds = Math.ceil(remaining / speed)
  
  return formatDuration(seconds)
}

/**
 * 解析运行时长字符串
 * @param {string} uptime - 运行时长字符串 (如 "3h 45m")
 * @returns {string} 格式化后的字符串
 */
export function parseUptime(uptime) {
  if (!uptime) return '-'
  return uptime
}
