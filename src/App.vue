<template>
  <div class="app-container flex h-screen overflow-hidden">
    <!-- 侧边栏 -->
    <Sidebar />
    
    <!-- 主内容区 -->
    <div class="main-content flex-1 flex flex-col overflow-hidden">
      <!-- 顶部栏 -->
      <TopBar />
      
      <!-- 页面内容 -->
      <div class="page-content flex-1 overflow-y-auto bg-light p-6">
        <router-view />
      </div>
    </div>
    
    <!-- 全局Loading -->
    <Loading :show="loadingStore.show" :message="loadingStore.message" />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useSystemStore } from '@/store/system'
import { useLoadingStore } from '@/store/loading'
import Sidebar from './components/Sidebar.vue'
import TopBar from './components/TopBar.vue'
import Loading from './components/Loading.vue'

// 启动系统监控
const systemStore = useSystemStore()
const loadingStore = useLoadingStore()

onMounted(() => {
  // 应用启动时开始监控系统资源
  systemStore.startMonitoring()
})

onUnmounted(() => {
  // 应用关闭时停止监控
  systemStore.stopMonitoring()
})
</script>

<style scoped>
.app-container {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>

