<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import FormulaireAuthGlitch from '@/components/FormulaireAuthGlitch.vue'

const authStore = useAuthStore()
const successMessage = ref('')

const fields = [{ id: 'email', label: 'EMAIL', type: 'email' }]

async function handleSubmit(payload) {
  successMessage.value = ''

  try {
    await authStore.requestPasswordReset(payload.email)
    successMessage.value = 'Si cet email existe, un lien de réinitialisation a été envoyé.'
  } catch (err) {
    console.error('Erreur de demande de réinitialisation:', err)
  }
}
</script>

<template>
  <FormulaireAuthGlitch
    title="RECUPERATION_COMPTE"
    :fields="fields"
    submit-text="ENVOYER_LIEN_RESET"
    loading-text="ENVOI..."
    :is-loading="authStore.isLoading"
    :error-message="authStore.error"
    @submit="handleSubmit"
  >
    <template #extra>
      <p v-if="successMessage" class="success-msg">{{ successMessage }}</p>
      <RouterLink to="/connexion" class="auth-link">Retour connexion</RouterLink>
    </template>
  </FormulaireAuthGlitch>
</template>

<style scoped>
.auth-link {
  color: #00f2ea;
  text-decoration: underline;
}

.success-msg {
  color: #22c55e;
  margin-bottom: 0.75rem;
}
</style>
