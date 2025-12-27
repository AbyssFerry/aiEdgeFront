<template>
  <Teleport to="body">
    <transition name="toast">
      <div
        v-if="visible"
        class="fixed top-20 right-6 z-50 max-w-md"
        @click="close"
      >
        <div
          class="rounded-lg shadow-lg p-4 flex items-start space-x-3 cursor-pointer"
          :class="toastClass"
        >
          <i :class="iconClass" class="text-xl mt-0.5"></i>
          <div class="flex-1">
            <p class="font-medium" v-if="title">{{ title }}</p>
            <p class="text-sm" :class="{ 'mt-1': title }">{{ message }}</p>
          </div>
          <button @click.stop="close" class="text-current opacity-70 hover:opacity-100">
            <i class="fa fa-times"></i>
          </button>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'info', // info, success, warning, error
    validator: (value) => ['info', 'success', 'warning', 'error'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 3000
  },
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const visible = ref(props.show)
let timer = null

const toastClass = computed(() => {
  const classes = {
    info: 'bg-blue-50 text-blue-800 border border-blue-200',
    success: 'bg-green-50 text-green-800 border border-green-200',
    warning: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
    error: 'bg-red-50 text-red-800 border border-red-200'
  }
  return classes[props.type]
})

const iconClass = computed(() => {
  const icons = {
    info: 'fa fa-info-circle text-blue-500',
    success: 'fa fa-check-circle text-green-500',
    warning: 'fa fa-exclamation-triangle text-yellow-500',
    error: 'fa fa-times-circle text-red-500'
  }
  return icons[props.type]
})

const close = () => {
  visible.value = false
  if (timer) {
    clearTimeout(timer)
  }
  emit('close')
}

watch(() => props.show, (newVal) => {
  visible.value = newVal
  if (newVal && props.duration > 0) {
    timer = setTimeout(close, props.duration)
  }
}, { immediate: true })
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
