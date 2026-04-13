<template>
  <header class="g-window">
    <div class="g-bar">
      <!-- Logo + nom du projet -->
      <div class="flex items-center gap-2">
        <span class="grid place-items-center w-8 h-8 rounded-lg text-black" style="background: var(--g-primary)">G</span>
        <span class="g-title">GSH Social</span>
      </div>

      <!-- Liens de navigation -->
      <nav class="hidden md:flex items-center gap-3">
        <RouterLink to="/fil" class="px-3 py-2 rounded-lg hover:bg-black/30">Fil</RouterLink>
        <RouterLink to="/profil" class="px-3 py-2 rounded-lg hover:bg-black/30">Profil</RouterLink>
        <RouterLink to="/conversations" class="px-3 py-2 rounded-lg hover:bg-black/30">Conversations</RouterLink>
      </nav>

      <!-- Zone de compte -->
      <div class="flex items-center gap-2">
        <template v-if="authStore.isAuthenticated">
          <span class="text-sm text-[var(--g-muted)]">{{ authStore.currentUser?.username }}</span>
          <button @click="handleLogout" class="px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition">
            Deconnexion
          </button>
        </template>
        <template v-else>
          <RouterLink to="/connexion" class="px-3 py-2 rounded-lg hover:bg-black/30">Connexion</RouterLink>
          <RouterLink to="/inscription" class="px-3 py-2 rounded-lg hover:bg-black/30">Inscription</RouterLink>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Store et navigation
const authStore = useAuthStore()
const router = useRouter()

// Deconnexion simple puis retour a la page connexion
async function handleLogout() {
  await authStore.logout()
  router.push('/connexion')
}
</script>

<style scoped>
/* Gardez tous les styles existants de votre BarreNavigation.vue */
.g-window {
  border: 1px solid var(--g-border);
  border-radius: 0.5rem;
  background: var(--g-bg-card);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.g-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--g-border);
  background: var(--g-bg-header);
}

.g-title {
  font-weight: 600;
  font-size: 1.125rem;
  color: var(--g-text);
}

/* Classes utilitaires Tailwind inline */
.flex { display: flex; }
.items-center { align-items: center; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.grid { display: grid; }
.place-items-center { place-items: center; }
.w-8 { width: 2rem; }
.h-8 { height: 2rem; }
.rounded-lg { border-radius: 0.5rem; }
.text-black { color: #000; }
.hidden { display: none; }
.px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
.py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
.text-sm { font-size: 0.875rem; }
.transition { transition: all 0.15s ease; }

@media (min-width: 768px) {
  .md\:flex { display: flex; }
}

a:hover, button:hover {
  opacity: 0.8;
}
</style>
