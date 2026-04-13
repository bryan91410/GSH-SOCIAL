// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth'

// Styles globaux (Tailwind)
import './assets/main.css'

const app = createApp(App)

// Pinia (store global)
const pinia = createPinia()
app.use(pinia)

// Garde de navigation simple pour proteger les routes
const authStore = useAuthStore(pinia)
router.beforeEach(async (to) => {
  if (!authStore.isAuthenticated) {
    await authStore.hydrateSession()
  }

  if (to.meta?.requiresAuth) {
    if (authStore.token && !authStore.currentUser) {
      await authStore.fetchCurrentUser()
    }

    if (!authStore.isAuthenticated) {
      return { name: 'connexion' }
    }
  }

  if ((to.name === 'connexion' || to.name === 'inscription') && authStore.isAuthenticated) {
    return { name: 'fil' }
  }

  return true
})

// Router
app.use(router)

// Mount
app.mount('#app')
