import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)
  const currentUser = computed(() => user.value)

  function setSession(data) {
    token.value = data?.token || null
    user.value = data?.user || null
  }

  function clearSession() {
    token.value = null
    user.value = null
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
    try {
      await authAPI.logout()
    } finally {
      clearSession()
    }
  }

  async function hydrateSession() {
    try {
      const data = await authAPI.getSession()
      setSession(data)
    } catch (_) {
      clearSession()
    }
  }

  async function fetchCurrentUser() {
    if (!isAuthenticated.value) {
      await hydrateSession()
      if (!isAuthenticated.value) {
        user.value = null
        return
      }
    }

    isLoading.value = true
    error.value = null

    try {
      user.value = await authAPI.getCurrentUser()
    } catch (err) {
      console.warn('Session invalide, déconnexion automatique', err)
      await logout()
    } finally {
      isLoading.value = false
    }
  }

  async function requestPasswordReset(email) {
    isLoading.value = true
    error.value = null

    try {
      await authAPI.requestPasswordReset(email)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updatePassword(newPassword) {
    isLoading.value = true
    error.value = null

    try {
      await authAPI.updatePassword(newPassword)
    } catch (err) {
      error.value = err.message
      throw err
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
    hydrateSession,
    fetchCurrentUser,
    requestPasswordReset,
    updatePassword
  }
})
