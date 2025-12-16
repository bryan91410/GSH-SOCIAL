import { defineStore } from 'pinia'
import { ref } from 'vue'
import { postsAPI } from '@/services/api'

export const usePostStore = defineStore('post', () => {
  const posts = ref([])
  const isLoading = ref(false)
  const likingIds = ref([])
  const error = ref(null)

  async function fetchPosts() {
    isLoading.value = true
    error.value = null
    
    try {
      posts.value = await postsAPI.getAll()
    } catch (err) {
      error.value = err.message
    } finally {
      isLoading.value = false
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
      posts.value = posts.value.filter(p => p.id !== postId)
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
      posts.value = posts.value.map(p => (p.id === postId ? updated : p))
      return updated
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      likingIds.value = likingIds.value.filter(id => id !== postId)
    }
  }

  return {
    posts,
    isLoading,
    likingIds,
    error,
    fetchPosts,
    createPost,
    deletePost,
    toggleLike
  }
})
