<template>
  <div class="min-h-screen grid grid-rows-[auto_1fr] gap-6 p-4">
    <NavBar />
    <main class="container mx-auto max-w-5xl w-full space-y-6">
      <slot />
    </main>
  </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue'
</script>
