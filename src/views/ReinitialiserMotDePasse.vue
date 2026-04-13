<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import FormulaireAuthGlitch from '@/components/FormulaireAuthGlitch.vue'
import { supabase } from '@/lib/supabase'

const authStore = useAuthStore()
const router = useRouter()
const successMessage = ref('')
const localError = ref('')

const fields = [
  { id: 'password', label: 'NOUVEAU_MOT_DE_PASSE', type: 'password' },
  { id: 'confirmPassword', label: 'CONFIRMER_MOT_DE_PASSE', type: 'password' }
]

onMounted(async () => {
  // Permet de récupérer une session à partir du lien email (hash URL)
  await authStore.hydrateSession()
})

async function handleSubmit(payload) {
  successMessage.value = ''
  localError.value = ''

  if (payload.password.length < 6) {
    localError.value = 'Le mot de passe doit contenir au moins 6 caractères'
    return
  }

  if (payload.password !== payload.confirmPassword) {
    localError.value = 'Les mots de passe ne correspondent pas'
    return
  }

  try {
    await authStore.updatePassword(payload.password)
    await supabase.auth.signOut()
    successMessage.value = 'Mot de passe modifié. Tu peux maintenant te reconnecter.'
    setTimeout(() => router.push('/connexion'), 1200)
  } catch (err) {
    console.error('Erreur de réinitialisation:', err)
  }
}
</script>

<template>
  <FormulaireAuthGlitch
    title="NOUVEAU_MOT_DE_PASSE"
    :fields="fields"
    submit-text="VALIDER"
    loading-text="MISE_A_JOUR..."
    :is-loading="authStore.isLoading"
    :error-message="localError || authStore.error"
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
