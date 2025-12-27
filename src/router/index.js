import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/chat'
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('@/views/Chat.vue')
  },
  {
    path: '/upload',
    name: 'Upload',
    component: () => import('@/views/ModelUpload.vue')
  },
  {
    path: '/download',
    name: 'Download',
    component: () => import('@/views/ModelDownload.vue')
  },
  {
    path: '/models',
    name: 'Models',
    component: () => import('@/views/ModelManage.vue')
  },
  {
    path: '/service',
    name: 'Service',
    component: () => import('@/views/ServiceControl.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
