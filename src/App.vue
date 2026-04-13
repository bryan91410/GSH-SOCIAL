<template>
  <GabaritPage>
    <ToastCenter />
    <div v-if="!isSupabaseConfigured" class="config-alert" role="alert">
      {{ SUPABASE_CONFIG_ERROR }}
    </div>
    <!-- Zone des pages routees -->
    <router-view />
  </GabaritPage>
</template>

<script setup>
// Composant racine de l application
import GabaritPage from '@/components/GabaritPage.vue'
import ToastCenter from '@/components/ToastCenter.vue'
import { isSupabaseConfigured, SUPABASE_CONFIG_ERROR } from '@/lib/supabase'
</script>

<style scoped>
.config-alert {
  margin: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(239, 68, 68, 0.55);
  background: rgba(127, 29, 29, 0.4);
  color: #fecaca;
  font-size: 0.92rem;
}
</style>
