<template>
  <div class="grid gap-4 lg:grid-cols-[320px_1fr]">
    <aside class="g-card space-y-4">
      <div>
        <h2 class="g-title mb-2">CONVERSATIONS</h2>
        <p class="text-xs text-[var(--g-muted)]">Clique sur un utilisateur pour démarrer un chat.</p>
      </div>

      <input
        v-model="userSearch"
        class="g-input"
        type="text"
        placeholder="Rechercher un utilisateur"
      />

      <div class="space-y-2 max-h-64 overflow-auto pr-1">
        <button
          v-for="user in filteredUsers"
          :key="user.id"
          class="user-btn"
          @click="createOrOpenConversation(user.id)"
        >
          <img :src="user.avatar" :alt="user.name" class="w-8 h-8 rounded-full" />
          <span>{{ user.name || user.username }}</span>
        </button>
      </div>

      <div class="g-divider"></div>

      <div class="space-y-2 max-h-96 overflow-auto pr-1">
        <button
          v-for="conversation in chatStore.conversations"
          :key="conversation.id"
          class="conversation-btn"
          :class="{ 'is-active': chatStore.activeConversationId === conversation.id }"
          @click="openConversation(conversation.id)"
        >
          <p class="font-semibold text-sm truncate">{{ conversation.title }}</p>
          <p class="text-xs text-[var(--g-muted)] truncate">
            {{ conversation.lastMessage?.content || 'Aucun message' }}
          </p>
        </button>
      </div>
    </aside>

    <section class="g-card flex flex-col min-h-[520px]">
      <header class="pb-3 mb-3 g-divider">
        <h2 class="g-title text-sm">{{ chatStore.activeConversation?.title || 'SELECTIONNE_UNE_CONVERSATION' }}</h2>
      </header>

      <div v-if="!chatStore.activeConversation" class="flex-1 grid place-items-center text-sm text-[var(--g-muted)]">
        Choisis une conversation à gauche pour commencer.
      </div>

      <template v-else>
        <div ref="messagesContainerRef" class="messages-list flex-1 overflow-auto pr-2 space-y-2">
          <article
            v-for="message in chatStore.activeMessages"
            :key="message.id"
            class="message-item"
            :class="{ 'mine': message.authorId === authStore.currentUser?.id }"
          >
            <p class="text-xs text-[var(--g-muted)] mb-1">
              {{ message.authorName }} · {{ formatDate(message.createdAt) }}
            </p>
            <p class="whitespace-pre-wrap">{{ message.content }}</p>
          </article>
        </div>

        <form @submit.prevent="submitMessage" class="pt-3 mt-3 g-divider flex gap-2">
          <input
            v-model="newMessage"
            class="g-input"
            type="text"
            placeholder="Écris ton message"
          />
          <button class="g-btn max-w-[170px]" data-text="ENVOYER" :disabled="chatStore.isSending">
            <span class="g-btn-text">{{ chatStore.isSending ? 'ENVOI...' : 'ENVOYER' }}</span>
          </button>
        </form>
      </template>
    </section>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

const chatStore = useChatStore()
const authStore = useAuthStore()
const toastStore = useToastStore()

const newMessage = ref('')
const userSearch = ref('')
const messagesContainerRef = ref(null)

const filteredUsers = computed(() => {
  const q = userSearch.value.trim().toLowerCase()
  if (!q) return chatStore.users

  return chatStore.users.filter((user) => {
    const label = `${user.name || ''} ${user.username || ''}`.toLowerCase()
    return label.includes(q)
  })
})

onMounted(async () => {
  try {
    await Promise.all([chatStore.loadUsers(), chatStore.loadConversations()])
    if (chatStore.activeConversationId) {
      await chatStore.openConversation(chatStore.activeConversationId)
    }
  } catch (error) {
    console.error('Erreur chargement conversations:', error)
    toastStore.error(chatStore.error || 'Impossible de charger les conversations')
  }
})

onUnmounted(async () => {
  await chatStore.unsubscribeRealtime()
})

watch(
  () => chatStore.activeMessages,
  async () => {
    await nextTick()
    if (messagesContainerRef.value) {
      messagesContainerRef.value.scrollTop = messagesContainerRef.value.scrollHeight
    }
  },
  { deep: true }
)

async function createOrOpenConversation(userId) {
  try {
    await chatStore.startConversation(userId)
  } catch (error) {
    console.error('Erreur création conversation:', error)
    toastStore.error(chatStore.error || 'Impossible de créer la conversation')
  }
}

async function openConversation(conversationId) {
  try {
    await chatStore.openConversation(conversationId)
  } catch (error) {
    console.error('Erreur ouverture conversation:', error)
    toastStore.error(chatStore.error || 'Impossible de charger les messages')
  }
}

async function submitMessage() {
  const content = newMessage.value.trim()
  if (!content) {
    toastStore.info('Message vide')
    return
  }

  try {
    await chatStore.sendMessage(content)
    newMessage.value = ''
  } catch (error) {
    console.error('Erreur envoi message:', error)
    toastStore.error(chatStore.error || 'Impossible d envoyer le message')
  }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit'
  })
}
</script>

<style scoped>
.user-btn,
.conversation-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-align: left;
  border: 1px solid var(--g-border);
  background: #0f1214;
  border-radius: 0.75rem;
  padding: 0.55rem 0.65rem;
}

.conversation-btn {
  display: block;
}

.conversation-btn.is-active {
  border-color: var(--g-primary);
  box-shadow: 0 0 0 1px rgba(0, 242, 234, 0.2);
}

.messages-list {
  min-height: 280px;
}

.message-item {
  background: #111418;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 0.75rem;
  padding: 0.6rem 0.75rem;
  max-width: 82%;
}

.message-item.mine {
  margin-left: auto;
  border-color: rgba(0, 242, 234, 0.3);
}
</style>
