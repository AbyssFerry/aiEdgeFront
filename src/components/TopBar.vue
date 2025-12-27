<template>
  <div class="topbar bg-white shadow-sm px-6 py-4 flex items-center justify-between">
    <div class="flex items-center space-x-4">
      <!-- 移动端菜单按钮 -->
      <button class="md:hidden text-gray-600 hover:text-gray-900">
        <i class="fa fa-bars text-xl"></i>
      </button>
      
      <!-- 页面标题 -->
      <h2 class="text-xl font-semibold text-gray-800">{{ pageTitle }}</h2>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const pageTitles = {
  '/chat': '聊天界面',
  '/upload': '模型上传',
  '/download': '模型下载',
  '/models': '模型管理',
  '/service': '服务控制'
}

const pageTitle = computed(() => {
  return pageTitles[route.path] || 'AiEdge'
})
</script>

<style scoped>
.topbar {
  height: 64px;
}
</style>
