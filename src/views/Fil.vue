<template>
  <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
    <section class="space-y-4">
      <div class="g-window">
        <div class="g-bar">
          <span class="g-title">FIL_SECURISE</span>
          <div class="flex gap-1">
            <span class="g-dot"></span><span class="g-dot"></span><span class="g-dot"></span>
          </div>
        </div>

        <div class="p-4">
          <form @submit.prevent="submitPost">
            <div class="g-field mb-4">
              <textarea
                v-model="newPostText"
                class="g-input min-h-[110px]"
                placeholder=" "
              ></textarea>
              <label class="g-label" data-text="QUOI_DE_NEUF">QUOI_DE_NEUF</label>
            </div>

            <div v-if="imagePreviewUrl" class="mb-4 relative">
              <img :src="imagePreviewUrl" alt="Preview" class="rounded-lg max-h-64 w-full object-cover" />
              <button
                type="button"
                @click="clearImage"
                class="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div class="flex items-center gap-2">
              <label class="flex-1 cursor-pointer">
                <input
                  type="file"
                  @change="onImageSelect"
                  accept="image/*"
                  class="hidden"
                  ref="fileInputRef"
                />
                <div class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-[var(--g-border)] hover:border-[var(--g-primary)] transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span class="text-sm">{{ imagePreviewUrl ? 'CHANGER_IMAGE' : 'AJOUTER_IMAGE' }}</span>
                </div>
              </label>

              <button
                type="submit"
                class="g-btn flex-1"
                data-text="PUBLIER"
                :disabled="isBusy"
              >
                <span class="g-btn-text">{{ isBusy ? 'PUBLICATION...' : 'PUBLIER' }}</span>
              </button>
            </div>

            <p v-if="postStore.error" class="text-red-500 text-sm mt-2">{{ postStore.error }}</p>
          </form>
        </div>
      </div>

      <div v-if="postStore.isLoading && postStore.posts.length === 0" class="g-card text-center">
        <div class="g-title">CHARGEMENT...</div>
      </div>

      <article
        v-for="post in postStore.posts"
        :key="post.id"
        class="g-card"
      >
        <div class="flex items-start gap-3 mb-3">
          <img
            :src="post.authorAvatar"
            :alt="post.authorName"
            class="w-10 h-10 rounded-full"
          />
          <div class="flex-1">
            <div class="g-title text-sm">{{ post.authorName }}</div>
            <div class="text-xs text-[var(--g-muted)]">{{ formatDate(post.createdAt) }}</div>
          </div>
          <button
            v-if="authStore.currentUser?.id === post.authorId"
            @click="confirmAndDeletePost(post.id)"
            class="text-red-500 hover:text-red-400 text-sm"
          >
            SUPPRIMER
          </button>
        </div>

        <p v-if="post.content" class="mb-3 whitespace-pre-wrap">{{ post.content }}</p>

        <img
          v-if="post.imageUrl"
          :src="post.imageUrl"
          :alt="post.content || 'image du post'"
          class="rounded-lg w-full mb-3"
        />

        <div class="flex items-center gap-4 text-sm text-[var(--g-muted)] mb-3">
          <button
            class="flex items-center gap-1 hover:text-[var(--g-primary)] transition disabled:opacity-50"
            @click="togglePostLike(post)"
            :disabled="postStore.likingIds.includes(post.id)"
            aria-label="Aimer le post"
            :class="{ 'text-[var(--g-primary)]': isPostLikedByMe(post) }"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span>{{ post.likes || 0 }}</span>
          </button>

          <button
            class="hover:text-[var(--g-primary)] transition"
            @click="toggleComments(post.id)"
            aria-label="Afficher les commentaires"
          >
            {{ showComments(post.id) ? 'MASQUER' : 'COMMENTAIRES' }} ({{ post.commentsCount || 0 }})
          </button>
        </div>

        <section v-if="showComments(post.id)" class="comments-wrap">
          <div v-if="post.comments?.length" class="space-y-2 mb-3">
            <article v-for="comment in post.comments" :key="comment.id" class="comment-item">
              <div class="flex items-start gap-2">
                <img :src="comment.authorAvatar" :alt="comment.authorName" class="w-8 h-8 rounded-full" />
                <div class="flex-1">
                  <div class="flex items-center justify-between gap-2">
                    <p class="text-sm font-semibold">{{ comment.authorName }}</p>
                    <button
                      v-if="authStore.currentUser?.id === comment.authorId"
                      class="text-xs text-red-400 hover:text-red-300"
                      @click="removeComment(post.id, comment.id)"
                    >
                      SUPPRIMER
                    </button>
                  </div>
                  <p class="text-sm whitespace-pre-wrap">{{ comment.content }}</p>
                  <p class="text-xs text-[var(--g-muted)]">{{ formatDate(comment.createdAt) }}</p>
                </div>
              </div>
            </article>
          </div>
          <p v-else class="text-xs text-[var(--g-muted)] mb-2">Aucun commentaire</p>

          <form @submit.prevent="submitComment(post.id)" class="flex gap-2">
            <input
              v-model="commentInputs[post.id]"
              type="text"
              class="g-input"
              placeholder="Ajouter un commentaire"
            />
            <button
              type="submit"
              class="px-3 py-2 rounded-lg border border-[var(--g-border)] hover:border-[var(--g-primary)] transition disabled:opacity-50"
              :disabled="postStore.commentingIds.includes(post.id)"
            >
              ENVOYER
            </button>
          </form>
        </section>
      </article>

      <div v-if="postStore.hasMore && postStore.posts.length > 0" class="text-center">
        <button
          class="g-btn max-w-xs"
          data-text="CHARGER_PLUS"
          :disabled="postStore.isLoadingMore"
          @click="loadMorePosts"
        >
          <span class="g-btn-text">{{ postStore.isLoadingMore ? 'CHARGEMENT...' : 'CHARGER_PLUS' }}</span>
        </button>
      </div>

      <div v-if="!postStore.isLoading && postStore.posts.length === 0" class="g-card text-center">
        <div class="g-title mb-2">AUCUNE_DONNEE</div>
        <p class="text-sm text-[var(--g-muted)]">Soyez le premier a publier quelque chose !</p>
      </div>
    </section>

    <aside class="space-y-4">
      <div class="g-card">
        <div class="g-title mb-2">INFOS_UTILISATEUR</div>
        <div v-if="authStore.currentUser" class="space-y-2">
          <div class="flex items-center gap-2">
            <img
              :src="authStore.currentUser.avatar"
              :alt="authStore.currentUser.name"
              class="w-12 h-12 rounded-full"
            />
            <div>
              <div class="font-bold">{{ authStore.currentUser.name }}</div>
              <div class="text-sm text-[var(--g-muted)]">@{{ authStore.currentUser.username }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="g-card">
        <div class="g-title mb-2">STATISTIQUES</div>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-[var(--g-muted)]">TOTAL_PUBLICATIONS</span>
            <span class="text-[var(--g-primary)]">{{ postStore.posts.length }}</span>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePostStore } from '@/stores/post'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

const postStore = usePostStore()
const authStore = useAuthStore()
const toastStore = useToastStore()
const router = useRouter()

const newPostText = ref('')
const imagePreviewUrl = ref(null)
const fileInputRef = ref(null)
const isSubmitting = ref(false)
const isBusy = computed(() => postStore.isLoading || isSubmitting.value)

const expandedPostIds = ref([])
const commentInputs = ref({})

onMounted(async () => {
  try {
    await postStore.fetchPosts({ reset: true })
  } catch (error) {
    console.error('Erreur de chargement:', error)
    router.push('/connexion')
  }
})

function ensureAuthenticated() {
  if (!authStore.isAuthenticated) {
    toastStore.error('Connecte-toi pour continuer')
    router.push('/connexion')
    return false
  }
  return true
}

function onImageSelect(event) {
  const file = event.target.files?.[0]
  if (!file) return

  if (file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreviewUrl.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

function clearImage() {
  imagePreviewUrl.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

async function submitPost() {
  if (!ensureAuthenticated()) return

  const content = newPostText.value.trim()
  if (!content && !imagePreviewUrl.value) {
    toastStore.info('Ajoute du texte ou une image avant de publier')
    return
  }

  try {
    isSubmitting.value = true
    await postStore.createPost({
      content,
      imageUrl: imagePreviewUrl.value
    })

    newPostText.value = ''
    clearImage()
    toastStore.success('Publication envoyée')
  } catch (error) {
    console.error('Erreur lors de la publication:', error)
    toastStore.error(`Erreur publication: ${error.message}`)
  } finally {
    isSubmitting.value = false
  }
}

async function loadMorePosts() {
  await postStore.fetchPosts({ reset: false })
}

async function togglePostLike(post) {
  if (!ensureAuthenticated()) return
  try {
    await postStore.toggleLike(post.id)
  } catch (error) {
    console.error('Erreur lors du like:', error)
    toastStore.error(`Erreur like: ${error.message}`)
  }
}

async function confirmAndDeletePost(postId) {
  if (confirm('Supprimer ce post ?')) {
    try {
      await postStore.deletePost(postId)
      toastStore.success('Post supprimé')
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toastStore.error('Erreur lors de la suppression')
    }
  }
}

function toggleComments(postId) {
  if (expandedPostIds.value.includes(postId)) {
    expandedPostIds.value = expandedPostIds.value.filter((id) => id !== postId)
    return
  }

  expandedPostIds.value = [...expandedPostIds.value, postId]
}

function showComments(postId) {
  return expandedPostIds.value.includes(postId)
}

async function submitComment(postId) {
  if (!ensureAuthenticated()) return

  const content = (commentInputs.value[postId] || '').trim()
  if (!content) {
    toastStore.info('Le commentaire est vide')
    return
  }

  try {
    await postStore.addComment(postId, content)
    commentInputs.value[postId] = ''
    if (!showComments(postId)) {
      toggleComments(postId)
    }
  } catch (error) {
    console.error('Erreur commentaire:', error)
    toastStore.error(`Erreur commentaire: ${error.message}`)
  }
}

async function removeComment(postId, commentId) {
  try {
    await postStore.deleteComment(postId, commentId)
    toastStore.success('Commentaire supprimé')
  } catch (error) {
    console.error('Erreur suppression commentaire:', error)
    toastStore.error(`Erreur suppression: ${error.message}`)
  }
}

function isPostLikedByMe(post) {
  const userId = authStore.currentUser?.id
  if (!userId || !post.likedBy) return false
  return post.likedBy.includes(userId)
}

function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "a l'instant"
  if (minutes < 60) return `${minutes} min`
  if (hours < 24) return `${hours} h`
  if (days < 7) return `${days} j`
  return date.toLocaleDateString('fr-FR')
}
</script>

<style scoped>
.g-input {
  resize: vertical;
}

.comments-wrap {
  border-top: 1px solid var(--g-border);
  padding-top: 0.75rem;
}

.comment-item {
  border: 1px solid rgba(0, 242, 234, 0.15);
  border-radius: 0.75rem;
  padding: 0.55rem 0.7rem;
}
</style>
