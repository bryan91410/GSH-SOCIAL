<script setup>
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()
</script>

<template>
  <div class="toast-wrap" aria-live="polite" aria-atomic="true">
    <div
      v-for="toast in toastStore.toasts"
      :key="toast.id"
      class="toast-item"
      :class="`toast-${toast.type}`"
    >
      <span>{{ toast.message }}</span>
      <button class="toast-close" @click="toastStore.remove(toast.id)" aria-label="Fermer">×</button>
    </div>
  </div>
</template>

<style scoped>
.toast-wrap {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  display: grid;
  gap: 0.5rem;
  width: min(90vw, 360px);
}

.toast-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  border: 1px solid var(--g-border);
  background: #101214;
  color: var(--g-text);
  padding: 0.7rem 0.9rem;
  border-radius: 0.75rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

.toast-success {
  border-color: rgba(34, 197, 94, 0.45);
}

.toast-error {
  border-color: rgba(239, 68, 68, 0.45);
}

.toast-info {
  border-color: rgba(0, 242, 234, 0.35);
}

.toast-close {
  color: inherit;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  line-height: 1;
}
</style>
