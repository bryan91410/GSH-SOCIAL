<template>
  <div class="min-h-screen grid grid-rows-[auto_1fr] gap-6 p-4">
    <!-- Barre de navigation principale -->
    <BarreNavigation />
    <!-- Zone de contenu des pages -->
    <main class="container mx-auto max-w-5xl w-full space-y-6">
      <slot />
    </main>
  </div>
</template>

<script setup>
// Layout global de l application
import BarreNavigation from '@/components/BarreNavigation.vue'
</script>
