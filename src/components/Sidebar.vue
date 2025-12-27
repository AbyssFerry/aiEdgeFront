<template>
  <div class="sidebar bg-dark text-white h-full flex flex-col">
    <!-- Logo区域 -->
    <div class="logo-section p-6 border-b border-gray-700">
      <div class="flex items-center space-x-3">
        <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
          <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <h1 class="text-xl font-bold">AiEdge</h1>
          <p class="text-xs text-gray-400">边缘AI模型管理平台</p>
        </div>
      </div>
    </div>

    <!-- 导航菜单 -->
    <nav class="flex-1 py-6 px-3 overflow-y-auto">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="nav-item flex items-center space-x-3 px-4 py-3 mb-2 rounded-lg transition-all duration-200 hover:bg-gray-700"
        :class="{ 'bg-primary text-white': isActive(item.path), 'text-gray-300': !isActive(item.path) }"
      >
        <i :class="item.icon" class="w-5 text-center"></i>
        <span class="font-medium">{{ item.title }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const menuItems = [
  { path: '/chat', title: '聊天界面', icon: 'fa fa-comments-o' },
  { path: '/upload', title: '模型上传', icon: 'fa fa-cloud-upload' },
  { path: '/download', title: '模型下载', icon: 'fa fa-cloud-download' },
  { path: '/models', title: '模型管理', icon: 'fa fa-database' },
  { path: '/service', title: '服务控制', icon: 'fa fa-server' }
]

const isActive = (path) => {
  return route.path === path
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  min-width: 260px;
}

.nav-item.router-link-active {
  background-color: var(--primary-color, #3B82F6);
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -260px;
    top: 0;
    z-index: 100;
    transition: left 0.3s;
  }
  
  .sidebar.mobile-open {
    left: 0;
  }
}
</style>
