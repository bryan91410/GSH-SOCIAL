import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { chatAPI } from '@/services/api'
import { supabase } from '@/lib/supabase'

export const useChatStore = defineStore('chat', () => {
  const users = ref([])
  const conversations = ref([])
  const messagesByConversation = ref({})
  const activeConversationId = ref(null)
  const activeChannel = ref(null)
  const isLoading = ref(false)
  const isSending = ref(false)
  const error = ref(null)

  const activeConversation = computed(() =>
    conversations.value.find((conversation) => conversation.id === activeConversationId.value) || null
  )

  const activeMessages = computed(() => {
    if (!activeConversationId.value) return []
    return messagesByConversation.value[activeConversationId.value] || []
  })

  function mergeIncomingMessage(message) {
    const conversationId = message.conversationId
    const currentMessages = messagesByConversation.value[conversationId] || []

    if (currentMessages.some((item) => item.id === message.id)) {
      return
    }

    messagesByConversation.value = {
      ...messagesByConversation.value,
      [conversationId]: [...currentMessages, message]
    }

    const existingConversation = conversations.value.find((conv) => conv.id === conversationId)
    if (!existingConversation) return

    conversations.value = conversations.value
      .map((conversation) => {
        if (conversation.id !== conversationId) return conversation

        return {
          ...conversation,
          updatedAt: message.createdAt,
          lastMessage: {
            id: message.id,
            conversation_id: message.conversationId,
            content: message.content,
            author_id: message.authorId,
            created_at: message.createdAt
          }
        }
      })
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  }

  async function unsubscribeRealtime() {
    if (activeChannel.value) {
      await supabase.removeChannel(activeChannel.value)
      activeChannel.value = null
    }
  }

  async function subscribeToConversation(conversationId) {
    await unsubscribeRealtime()

    activeChannel.value = supabase
      .channel(`chat-conversation-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          try {
            const message = await chatAPI.getMessageById(payload.new.id)
            mergeIncomingMessage(message)
          } catch (err) {
            console.error('Erreur message realtime:', err)
          }
        }
      )
      .subscribe()
  }

  async function loadUsers() {
    error.value = null

    try {
      users.value = await chatAPI.getUsers()
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function loadConversations() {
    isLoading.value = true
    error.value = null

    try {
      conversations.value = await chatAPI.getConversations()

      if (!activeConversationId.value && conversations.value.length) {
        activeConversationId.value = conversations.value[0].id
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function openConversation(conversationId) {
    const needsLoading = !messagesByConversation.value[conversationId]
    activeConversationId.value = conversationId

    if (needsLoading) {
      await loadMessages(conversationId)
    }

    await subscribeToConversation(conversationId)
  }

  async function loadMessages(conversationId) {
    error.value = null

    try {
      const messages = await chatAPI.getMessages(conversationId)
      messagesByConversation.value = {
        ...messagesByConversation.value,
        [conversationId]: messages
      }
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function startConversation(targetUserId) {
    error.value = null

    try {
      const conversationId = await chatAPI.startConversation(targetUserId)
      await loadConversations()
      await openConversation(conversationId)
      return conversationId
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function sendMessage(content) {
    if (!activeConversationId.value) {
      throw new Error('Aucune conversation sélectionnée')
    }

    isSending.value = true
    error.value = null

    try {
      const newMessage = await chatAPI.sendMessage(activeConversationId.value, content)
      mergeIncomingMessage(newMessage)
      return newMessage
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isSending.value = false
    }
  }

  return {
    users,
    conversations,
    messagesByConversation,
    activeConversationId,
    activeConversation,
    activeMessages,
    isLoading,
    isSending,
    error,
    loadUsers,
    loadConversations,
    openConversation,
    loadMessages,
    startConversation,
    sendMessage,
    unsubscribeRealtime
  }
})
