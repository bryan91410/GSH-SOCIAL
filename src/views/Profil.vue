<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

// 1) Store utilisateur
const authStore = useAuthStore()

// 2) Au chargement, on s assure d avoir le profil
onMounted(async () => {
  await authStore.fetchCurrentUser()
})
</script>

<template>
  <div class="g-window">
    <div class="g-bar">
      <span class="g-title">PANNEAU_PROFIL</span>
      <div class="flex gap-1"><span class="g-dot"></span><span class="g-dot"></span><span class="g-dot"></span></div>
    </div>

    <div class="p-4 grid gap-4 md:grid-cols-2">
      <!-- Informations en lecture seule (pas d API d edition pour le moment) -->
      <div class="g-field">
        <input class="g-input" :value="authStore.currentUser?.name || ''" placeholder=" " readonly />
        <label class="g-label" data-text="NOM">NOM</label>
      </div>
      <div class="g-field">
        <input class="g-input" :value="authStore.currentUser?.email || ''" placeholder=" " readonly />
        <label class="g-label" data-text="EMAIL">EMAIL</label>
      </div>
      <div class="g-field md:col-span-2">
        <input class="g-input" value="MEMBRE" placeholder=" " readonly />
        <label class="g-label" data-text="ROLE">ROLE</label>
      </div>
    </div>
  </div>
</template>
