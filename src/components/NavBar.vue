<template>
  <header class="g-window">
    <div class="g-bar">
      <div class="flex items-center gap-2">
        <span class="grid place-items-center w-8 h-8 rounded-lg text-black" style="background: var(--g-primary)">G</span>
        <span class="g-title">GSH Social</span>
      </div>

      <nav class="hidden md:flex items-center gap-3">
        <RouterLink to="/" class="px-3 py-2 rounded-lg hover:bg-black/30">Feed</RouterLink>
        <RouterLink to="/profile" class="px-3 py-2 rounded-lg hover:bg-black/30">Profile</RouterLink>
      </nav>

      <div class="flex items-center gap-2">
        <template v-if="authStore.isAuthenticated">
          <span class="text-sm text-[var(--g-muted)]">{{ authStore.currentUser?.username }}</span>
          <button @click="handleLogout" class="px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition">
            Logout
          </button>
        </template>
        <template v-else>
          <RouterLink to="/login" class="px-3 py-2 rounded-lg hover:bg-black/30">Log in</RouterLink>
          <RouterLink to="/register" class="px-3 py-2 rounded-lg hover:bg-black/30">Sign up</RouterLink>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
/* Gardez tous les styles existants de votre NavBar.vue */
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
