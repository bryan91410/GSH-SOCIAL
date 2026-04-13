<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import FormulaireAuthGlitch from '@/components/FormulaireAuthGlitch.vue'

// 1) Store et navigation
const authStore = useAuthStore()
const router = useRouter()

// 2) Champs du formulaire
const fields = [
  { id: 'username', label: 'IDENTIFIANT', type: 'text' },
  { id: 'email', label: 'EMAIL', type: 'email' },
  { id: 'password', label: 'MOT_DE_PASSE', type: 'password' }
]

// 3) Soumission du formulaire
async function handleSubmit(payload) {
  try {
    await authStore.register(payload)
    router.push('/fil')
  } catch (err) {
    console.error('Erreur d\'inscription:', err)
  }
}
</script>

<template>
  <FormulaireAuthGlitch
    title="CREER_COMPTE_SECURISE"
    :fields="fields"
    submit-text="CREER_COMPTE"
    loading-text="CHARGEMENT..."
    :is-loading="authStore.isLoading"
    :error-message="authStore.error"
    @submit="handleSubmit"
  />
</template>
