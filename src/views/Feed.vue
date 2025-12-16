<template>
  <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
    <section class="space-y-4">
      <div class="g-window">
        <div class="g-bar">
          <span class="g-title">SECURE_FEED</span>
          <div class="flex gap-1">
            <span class="g-dot"></span><span class="g-dot"></span><span class="g-dot"></span>
          </div>
        </div>

        <div class="p-4">
          <form @submit.prevent="handlePost">
            <div class="g-field mb-4">
              <textarea
                v-model="postContent"
                class="g-input min-h-[110px]"
                placeholder=" "
              ></textarea>
              <label class="g-label" data-text="WHAT'S_NEW">WHAT'S_NEW</label>
            </div>

            <!-- Image preview -->
            <div v-if="imagePreview" class="mb-4 relative">
              <img :src="imagePreview" alt="Preview" class="rounded-lg max-h-64 w-full object-cover" />
              <button
                type="button"
                @click="removeImage"
                class="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div class="flex items-center gap-2">
              <label class="flex-1 cursor-pointer">
                <input
                  type="file"
                  @change="handleImageUpload"
                  accept="image/*"
                  class="hidden"
                  ref="fileInput"
                />
                <div class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-[var(--g-border)] hover:border-[var(--g-primary)] transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span class="text-sm">{{ imagePreview ? 'CHANGE_IMAGE' : 'ADD_IMAGE' }}</span>
                </div>
              </label>

              <button
                type="submit"
                class="g-btn flex-1"
                data-text="POST"
                :disabled="postStore.isLoading || isSubmitting"
              >
                <span class="g-btn-text">{{ postStore.isLoading || isSubmitting ? 'POSTING...' : 'POST' }}</span>
              </button>
            </div>

            <p v-if="postStore.error" class="text-red-500 text-sm mt-2">{{ postStore.error }}</p>
          </form>
        </div>
      </div>

      <!-- Posts list -->
      <div v-if="postStore.isLoading && postStore.posts.length === 0" class="g-card text-center">
        <div class="g-title">LOADING_DATA...</div>
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
            @click="deletePost(post.id)"
            class="text-red-500 hover:text-red-400 text-sm"
          >
            DELETE
          </button>
        </div>

        <p v-if="post.content" class="mb-3 whitespace-pre-wrap">{{ post.content }}</p>

        <img
          v-if="post.imageUrl"
          :src="post.imageUrl"
          :alt="post.content || 'post image'"
          class="rounded-lg w-full mb-3"
        />

        <div class="flex items-center gap-4 text-sm text-[var(--g-muted)]">
          <button
            class="flex items-center gap-1 hover:text-[var(--g-primary)] transition disabled:opacity-50"
            @click="toggleLike(post)"
            :disabled="postStore.likingIds.includes(post.id)"
            aria-label="Like post"
            :class="{ 'text-[var(--g-primary)]': isLikedByMe(post) }"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span>{{ post.likes || 0 }}</span>
          </button>
        </div>
      </article>

      <div v-if="!postStore.isLoading && postStore.posts.length === 0" class="g-card text-center">
        <div class="g-title mb-2">NO_DATA_FOUND</div>
        <p class="text-sm text-[var(--g-muted)]">Be the first to post something!</p>
      </div>
    </section>

    <aside class="space-y-4">
      <div class="g-card">
        <div class="g-title mb-2">USER_INFO</div>
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
        <div class="g-title mb-2">STATS</div>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-[var(--g-muted)]">TOTAL_POSTS</span>
            <span class="text-[var(--g-primary)]">{{ postStore.posts.length }}</span>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePostStore } from '@/stores/post'
import { useAuthStore } from '@/stores/auth'

const postStore = usePostStore()
const authStore = useAuthStore()
const router = useRouter()

const postContent = ref('')
const imagePreview = ref(null)
const imageFile = ref(null)
const fileInput = ref(null)
const isSubmitting = ref(false)

onMounted(async () => {
  try {
    // Toujours valider/rafraîchir la session en tentant de charger l'utilisateur courant
    await authStore.fetchCurrentUser()

    if (!authStore.isAuthenticated) {
      router.push('/login')
      return
    }

    await postStore.fetchPosts()
  } catch (error) {
    console.error('Error loading data:', error)
    router.push('/login')
  }
})

function handleImageUpload(event) {
  const file = event.target.files[0]
  if (file && file.type.startsWith('image/')) {
    imageFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

function removeImage() {
  imagePreview.value = null
  imageFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

async function handlePost() {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  if (!postContent.value.trim() && !imagePreview.value) {
    alert('Ajoute du texte ou une image avant de publier')
    return
  }

  try {
    isSubmitting.value = true
    await postStore.createPost({
      content: postContent.value.trim(),
      imageUrl: imagePreview.value
    })

    postContent.value = ''
    removeImage()
  } catch (error) {
    console.error('Error posting:', error)
    alert('Erreur lors de la publication: ' + error.message)
  } finally {
    isSubmitting.value = false
  }
}

async function toggleLike(post) {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  try {
    await postStore.toggleLike(post.id)
  } catch (error) {
    console.error('Error liking post:', error)
    alert('Erreur lors du like: ' + error.message)
  }
}

async function deletePost(postId) {
  if (confirm('Delete this post?')) {
    try {
      await postStore.deletePost(postId)
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Erreur lors de la suppression')
    }
  }
}

function isLikedByMe(post) {
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

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}
</script>

<style scoped>
.g-input {
  resize: vertical;
}
</style>
