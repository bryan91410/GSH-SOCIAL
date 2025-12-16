import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const isLoading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)
  const currentUser = computed(() => user.value)

  function setSession(data) {
    token.value = data.token
    user.value = data.user
    localStorage.setItem('token', data.token)
  }

  async function login(credentials) {
    isLoading.value = true
    error.value = null

    try {
      const data = await authAPI.login(credentials)
      setSession(data)
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function register(userData) {
    isLoading.value = true
    error.value = null

    try {
      const data = await authAPI.register(userData)
      setSession(data)
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  async function fetchCurrentUser() {
    if (!token.value) return

    isLoading.value = true
    error.value = null
    
    try {
      const data = await authAPI.getCurrentUser()
      user.value = data
    } catch (err) {
      // Token expiré/invalid -> on nettoie la session sans polluer l'UI d'un message
      console.warn('Session invalide, déconnexion automatique', err)
      await logout()
    } finally {
      isLoading.value = false
    }
  }

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    currentUser,
    login,
    register,
    logout,
    fetchCurrentUser
  }
})
