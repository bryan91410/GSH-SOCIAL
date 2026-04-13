import { defineStore } from 'pinia'
import { ref } from 'vue'
import { postsAPI } from '@/services/api'

const PAGE_SIZE = 10

export const usePostStore = defineStore('post', () => {
  const posts = ref([])
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const likingIds = ref([])
  const commentingIds = ref([])
  const error = ref(null)
  const currentPage = ref(1)
  const hasMore = ref(true)

  async function fetchPosts({ reset = true } = {}) {
    if (reset) {
      isLoading.value = true
      currentPage.value = 1
      hasMore.value = true
      posts.value = []
    } else {
      if (!hasMore.value || isLoadingMore.value) return
      isLoadingMore.value = true
      currentPage.value += 1
    }

    error.value = null

    try {
      const { items, hasMore: nextHasMore } = await postsAPI.getAll({
        page: currentPage.value,
        pageSize: PAGE_SIZE
      })

      hasMore.value = nextHasMore
      posts.value = reset ? items : [...posts.value, ...items]
    } catch (err) {
      error.value = err.message
      if (!reset) {
        currentPage.value = Math.max(1, currentPage.value - 1)
      }
    } finally {
      isLoading.value = false
      isLoadingMore.value = false
    }
  }

  async function createPost(postData) {
    isLoading.value = true
    error.value = null

    try {
      const data = await postsAPI.create(postData)
      posts.value.unshift(data)
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deletePost(postId) {
    isLoading.value = true
    error.value = null

    try {
      await postsAPI.delete(postId)
      posts.value = posts.value.filter((p) => p.id !== postId)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function toggleLike(postId) {
    likingIds.value = [...likingIds.value, postId]
    error.value = null

    try {
      const updated = await postsAPI.toggleLike(postId)
      posts.value = posts.value.map((p) => (p.id === postId ? updated : p))
      return updated
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      likingIds.value = likingIds.value.filter((id) => id !== postId)
    }
  }

  async function addComment(postId, content) {
    commentingIds.value = [...commentingIds.value, postId]
    error.value = null

    try {
      const updated = await postsAPI.createComment(postId, content)
      posts.value = posts.value.map((p) => (p.id === postId ? updated : p))
      return updated
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      commentingIds.value = commentingIds.value.filter((id) => id !== postId)
    }
  }

  async function deleteComment(postId, commentId) {
    commentingIds.value = [...commentingIds.value, postId]
    error.value = null

    try {
      const updated = await postsAPI.deleteComment(postId, commentId)
      posts.value = posts.value.map((p) => (p.id === postId ? updated : p))
      return updated
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      commentingIds.value = commentingIds.value.filter((id) => id !== postId)
    }
  }

  return {
    posts,
    isLoading,
    isLoadingMore,
    likingIds,
    commentingIds,
    error,
    hasMore,
    fetchPosts,
    createPost,
    deletePost,
    toggleLike,
    addComment,
    deleteComment
  }
})
