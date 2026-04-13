import { defineStore } from 'pinia'
import { ref } from 'vue'

let nextId = 1

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])

  function push(message, type = 'info', duration = 3500) {
    const id = nextId++
    toasts.value.push({ id, message, type })

    if (duration > 0) {
      window.setTimeout(() => remove(id), duration)
    }

    return id
  }

  function remove(id) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  function success(message, duration) {
    return push(message, 'success', duration)
  }

  function error(message, duration) {
    return push(message, 'error', duration)
  }

  function info(message, duration) {
    return push(message, 'info', duration)
  }

  return {
    toasts,
    push,
    remove,
    success,
    error,
    info
  }
})
