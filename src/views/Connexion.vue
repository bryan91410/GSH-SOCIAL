<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import FormulaireAuthGlitch from '@/components/FormulaireAuthGlitch.vue'

// 1) Store et navigation
const authStore = useAuthStore()
const router = useRouter()

// 2) Champs du formulaire
const fields = [
  { id: 'username', label: 'IDENTIFIANT', type: 'text' },
  { id: 'password', label: 'MOT_DE_PASSE', type: 'password' }
]

// 3) Soumission du formulaire
async function handleSubmit(payload) {
  try {
    await authStore.login(payload)
    router.push('/fil')
  } catch (err) {
    console.error('Erreur de connexion:', err)
  }
}
</script>

<template>
  <FormulaireAuthGlitch
    title="DONNEES_SECURISEES"
    :fields="fields"
    submit-text="DEMARRER_CONNEXION"
    loading-text="CHARGEMENT..."
    :is-loading="authStore.isLoading"
    :error-message="authStore.error"
    @submit="handleSubmit"
  >
    <template #extra>
      <RouterLink to="/mot-de-passe-oublie" class="auth-link">
        Mot de passe oublié ?
      </RouterLink>
    </template>
  </FormulaireAuthGlitch>
</template>

<style scoped>
.auth-link {
  color: #00f2ea;
  text-decoration: underline;
}
</style>
