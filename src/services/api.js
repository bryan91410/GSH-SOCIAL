import { supabase } from '@/lib/supabase'

const FALLBACK_AVATAR = 'https://i.pravatar.cc/150?img=1'
const DEFAULT_PAGE_SIZE = 10

const POST_SELECT = `
  id,
  content,
  author_id,
  image_url,
  created_at,
  profiles:author_id (id, username, name, avatar),
  post_likes (user_id),
  comments (
    id,
    post_id,
    content,
    author_id,
    created_at,
    profiles:author_id (id, username, name, avatar)
  )
`

function normalizeComment(row) {
  return {
    id: row.id,
    postId: row.post_id,
    content: row.content,
    authorId: row.author_id,
    authorName: row.profiles?.name || row.profiles?.username || 'Unknown',
    authorAvatar: row.profiles?.avatar || FALLBACK_AVATAR,
    createdAt: row.created_at
  }
}

function normalizePost(row) {
  const likedBy = row.post_likes?.map((like) => like.user_id) || []
  const comments = (row.comments || [])
    .slice()
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .map(normalizeComment)

  return {
    id: row.id,
    content: row.content || '',
    authorId: row.author_id,
    authorName: row.profiles?.name || row.profiles?.username || 'Unknown',
    authorAvatar: row.profiles?.avatar || FALLBACK_AVATAR,
    createdAt: row.created_at,
    likes: likedBy.length,
    imageUrl: row.image_url,
    likedBy,
    comments,
    commentsCount: comments.length
  }
}

function getErrorMessage(error, fallback = 'Erreur API') {
  return error?.message || fallback
}

async function getProfileByUserId(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, email, name, avatar')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw new Error(getErrorMessage(error, 'Impossible de charger le profil'))
  }

  return data
}

async function ensureProfile(user, preferredUsername = null) {
  const existing = await getProfileByUserId(user.id)
  if (existing) return existing

  const usernameBase = preferredUsername || user.user_metadata?.username || user.email?.split('@')[0] || 'user'
  const username = usernameBase.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20) || `user_${user.id.slice(0, 6)}`

  const profileToInsert = {
    id: user.id,
    username,
    email: user.email,
    name: user.user_metadata?.name || username,
    avatar: user.user_metadata?.avatar || `https://i.pravatar.cc/150?u=${user.id}`
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert(profileToInsert, { onConflict: 'id' })
    .select('id, username, email, name, avatar')
    .single()

  if (error) {
    throw new Error(getErrorMessage(error, 'Impossible de créer le profil utilisateur'))
  }

  return data
}

async function getProfileByIdentifier(identifier) {
  const normalized = identifier.trim().toLowerCase()

  if (normalized.includes('@')) {
    return { email: normalized }
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('email')
    .eq('username', normalized)
    .maybeSingle()

  if (error) {
    throw new Error(getErrorMessage(error, 'Impossible de résoudre cet identifiant'))
  }

  if (!data?.email) {
    throw new Error('Identifiants invalides')
  }

  return { email: data.email }
}

async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw new Error(getErrorMessage(error, 'Session invalide'))
  }

  return data.session
}

async function getCurrentUserWithProfile() {
  const session = await getCurrentSession()
  if (!session?.user) return null

  const profile = await ensureProfile(session.user)

  return {
    token: session.access_token,
    user: {
      id: session.user.id,
      username: profile.username,
      email: session.user.email,
      name: profile.name || profile.username,
      avatar: profile.avatar || FALLBACK_AVATAR
    }
  }
}

async function getCurrentAuthUser() {
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    throw new Error(getErrorMessage(error, 'Utilisateur non authentifié'))
  }

  return data.user
}

export const authAPI = {
  login: async (credentials) => {
    const identifier = credentials?.username || credentials?.email || ''
    const password = credentials?.password || ''

    if (!identifier || !password) {
      throw new Error('Champs manquants')
    }

    const { email } = await getProfileByIdentifier(identifier)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error || !data.session || !data.user) {
      throw new Error(getErrorMessage(error, 'Identifiants invalides'))
    }

    const profile = await ensureProfile(data.user)

    return {
      token: data.session.access_token,
      user: {
        id: data.user.id,
        username: profile.username,
        email: data.user.email,
        name: profile.name || profile.username,
        avatar: profile.avatar || FALLBACK_AVATAR
      }
    }
  },

  register: async (userData) => {
    const username = userData?.username?.trim()?.toLowerCase()
    const email = userData?.email?.trim()?.toLowerCase()
    const password = userData?.password

    if (!username || !email || !password) {
      throw new Error('Champs manquants')
    }

    const { data: existingUsername } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle()

    if (existingUsername) {
      throw new Error('Nom d utilisateur déjà utilisé')
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, name: username }
      }
    })

    if (error || !data.user) {
      throw new Error(getErrorMessage(error, 'Erreur lors de l inscription'))
    }

    await ensureProfile(data.user, username)

    if (!data.session) {
      throw new Error('Compte créé. Confirme ton email puis connecte-toi.')
    }

    return {
      token: data.session.access_token,
      user: {
        id: data.user.id,
        username,
        email: data.user.email,
        name: username,
        avatar: `https://i.pravatar.cc/150?u=${data.user.id}`
      }
    }
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(getErrorMessage(error, 'Erreur de déconnexion'))
    }
  },

  requestPasswordReset: async (email) => {
    if (!email?.trim()) {
      throw new Error('Email requis')
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe`
    })

    if (error) {
      throw new Error(getErrorMessage(error, 'Erreur lors de la demande de réinitialisation'))
    }
  },

  updatePassword: async (newPassword) => {
    if (!newPassword) {
      throw new Error('Mot de passe requis')
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      throw new Error(getErrorMessage(error, 'Erreur lors de la mise à jour du mot de passe'))
    }
  },

  getCurrentUser: async () => {
    const sessionData = await getCurrentUserWithProfile()
    if (!sessionData) {
      throw new Error('Session invalide')
    }
    return sessionData.user
  },

  getSession: async () => {
    return getCurrentUserWithProfile()
  }
}

export const postsAPI = {
  getAll: async ({ page = 1, pageSize = DEFAULT_PAGE_SIZE } = {}) => {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error } = await supabase
      .from('posts')
      .select(POST_SELECT)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      throw new Error(getErrorMessage(error, 'Impossible de charger les posts'))
    }

    const items = (data || []).map(normalizePost)
    return {
      items,
      hasMore: items.length === pageSize
    }
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from('posts')
      .select(POST_SELECT)
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(getErrorMessage(error, 'Post non trouvé'))
    }

    return normalizePost(data)
  },

  create: async (postData) => {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
      throw new Error(getErrorMessage(userError, 'Utilisateur non authentifié'))
    }

    const content = postData?.content?.trim() || ''
    const imageUrl = postData?.imageUrl || null

    if (!content && !imageUrl) {
      throw new Error('Ajoutez du texte ou une image')
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        content,
        image_url: imageUrl,
        author_id: userData.user.id
      })
      .select(POST_SELECT)
      .single()

    if (error) {
      throw new Error(getErrorMessage(error, 'Erreur lors de la publication'))
    }

    return normalizePost(data)
  },

  delete: async (id) => {
    const { error } = await supabase.from('posts').delete().eq('id', id)

    if (error) {
      throw new Error(getErrorMessage(error, 'Erreur lors de la suppression'))
    }
  },

  toggleLike: async (id) => {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
      throw new Error(getErrorMessage(userError, 'Utilisateur non authentifié'))
    }

    const userId = userData.user.id

    const { data: existingLike, error: likeFetchError } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('post_id', id)
      .eq('user_id', userId)
      .maybeSingle()

    if (likeFetchError) {
      throw new Error(getErrorMessage(likeFetchError, 'Erreur lors du like'))
    }

    if (existingLike) {
      const { error: deleteError } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', id)
        .eq('user_id', userId)

      if (deleteError) {
        throw new Error(getErrorMessage(deleteError, 'Erreur lors du unlike'))
      }
    } else {
      const { error: insertError } = await supabase
        .from('post_likes')
        .insert({ post_id: id, user_id: userId })

      if (insertError) {
        throw new Error(getErrorMessage(insertError, 'Erreur lors du like'))
      }
    }

    return postsAPI.getById(id)
  },

  createComment: async (postId, content) => {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
      throw new Error(getErrorMessage(userError, 'Utilisateur non authentifié'))
    }

    const sanitizedContent = content?.trim()
    if (!sanitizedContent) {
      throw new Error('Commentaire vide')
    }

    const { error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        author_id: userData.user.id,
        content: sanitizedContent
      })

    if (error) {
      throw new Error(getErrorMessage(error, 'Erreur lors de l ajout du commentaire'))
    }

    return postsAPI.getById(postId)
  },

  deleteComment: async (postId, commentId) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('post_id', postId)

    if (error) {
      throw new Error(getErrorMessage(error, 'Erreur lors de la suppression du commentaire'))
    }

    return postsAPI.getById(postId)
  }
}

function normalizeMessage(row) {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    authorId: row.author_id,
    authorName: row.profiles?.name || row.profiles?.username || 'Unknown',
    authorAvatar: row.profiles?.avatar || FALLBACK_AVATAR,
    content: row.content,
    createdAt: row.created_at
  }
}

export const chatAPI = {
  getUsers: async () => {
    const currentUser = await getCurrentAuthUser()

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, name, avatar')
      .neq('id', currentUser.id)
      .order('username', { ascending: true })

    if (error) {
      throw new Error(getErrorMessage(error, 'Impossible de charger les utilisateurs'))
    }

    return data || []
  },

  getConversations: async () => {
    const currentUser = await getCurrentAuthUser()

    const { data: memberRows, error: memberError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', currentUser.id)

    if (memberError) {
      throw new Error(getErrorMessage(memberError, 'Impossible de charger les conversations'))
    }

    const conversationIds = [...new Set((memberRows || []).map((row) => row.conversation_id))]
    if (conversationIds.length === 0) return []

    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('id, created_at, updated_at')
      .in('id', conversationIds)
      .order('updated_at', { ascending: false })

    if (convError) {
      throw new Error(getErrorMessage(convError, 'Impossible de charger les conversations'))
    }

    const { data: participants, error: participantsError } = await supabase
      .from('conversation_participants')
      .select('conversation_id, user_id, profiles:user_id(id, username, name, avatar)')
      .in('conversation_id', conversationIds)

    if (participantsError) {
      throw new Error(getErrorMessage(participantsError, 'Impossible de charger les participants'))
    }

    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('id, conversation_id, content, author_id, created_at')
      .in('conversation_id', conversationIds)
      .order('created_at', { ascending: false })
      .limit(500)

    if (messagesError) {
      throw new Error(getErrorMessage(messagesError, 'Impossible de charger les derniers messages'))
    }

    const lastMessageByConversation = {}
    for (const message of messages || []) {
      if (!lastMessageByConversation[message.conversation_id]) {
        lastMessageByConversation[message.conversation_id] = message
      }
    }

    return (conversations || []).map((conversation) => {
      const convParticipants = (participants || [])
        .filter((item) => item.conversation_id === conversation.id)
        .map((item) => ({
          id: item.profiles?.id || item.user_id,
          username: item.profiles?.username || 'unknown',
          name: item.profiles?.name || item.profiles?.username || 'Unknown',
          avatar: item.profiles?.avatar || FALLBACK_AVATAR
        }))

      const otherParticipants = convParticipants.filter((p) => p.id !== currentUser.id)
      const title = otherParticipants.length
        ? otherParticipants.map((p) => p.name).join(', ')
        : 'Conversation'

      return {
        id: conversation.id,
        createdAt: conversation.created_at,
        updatedAt: conversation.updated_at,
        participants: convParticipants,
        title,
        lastMessage: lastMessageByConversation[conversation.id] || null
      }
    })
  },

  getMessages: async (conversationId) => {
    const { data, error } = await supabase
      .from('messages')
      .select(
        `
          id,
          conversation_id,
          author_id,
          content,
          created_at,
          profiles:author_id (id, username, name, avatar)
        `
      )
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(getErrorMessage(error, 'Impossible de charger les messages'))
    }

    return (data || []).map(normalizeMessage)
  },

  getMessageById: async (messageId) => {
    const { data, error } = await supabase
      .from('messages')
      .select(
        `
          id,
          conversation_id,
          author_id,
          content,
          created_at,
          profiles:author_id (id, username, name, avatar)
        `
      )
      .eq('id', messageId)
      .single()

    if (error) {
      throw new Error(getErrorMessage(error, 'Impossible de charger le message'))
    }

    return normalizeMessage(data)
  },

  startConversation: async (targetUserId) => {
    const currentUser = await getCurrentAuthUser()

    if (targetUserId === currentUser.id) {
      throw new Error('Tu ne peux pas créer une conversation avec toi-même')
    }

    const myConversationIdsResult = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', currentUser.id)

    if (myConversationIdsResult.error) {
      throw new Error(getErrorMessage(myConversationIdsResult.error, 'Impossible de charger les conversations'))
    }

    const myConversationIds = [...new Set((myConversationIdsResult.data || []).map((row) => row.conversation_id))]

    if (myConversationIds.length > 0) {
      const otherRowsResult = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .in('conversation_id', myConversationIds)
        .eq('user_id', targetUserId)

      if (otherRowsResult.error) {
        throw new Error(getErrorMessage(otherRowsResult.error, 'Impossible de vérifier les conversations'))
      }

      const candidateIds = [...new Set((otherRowsResult.data || []).map((row) => row.conversation_id))]

      if (candidateIds.length > 0) {
        const countsResult = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .in('conversation_id', candidateIds)

        if (countsResult.error) {
          throw new Error(getErrorMessage(countsResult.error, 'Impossible de vérifier les participants'))
        }

        const counts = {}
        for (const row of countsResult.data || []) {
          counts[row.conversation_id] = (counts[row.conversation_id] || 0) + 1
        }

        const existingDirectConversationId = candidateIds.find((id) => counts[id] === 2)
        if (existingDirectConversationId) {
          return existingDirectConversationId
        }
      }
    }

    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .insert({})
      .select('id')
      .single()

    if (conversationError || !conversation) {
      throw new Error(getErrorMessage(conversationError, 'Impossible de créer la conversation'))
    }

    const { error: selfMemberError } = await supabase
      .from('conversation_participants')
      .insert({
        conversation_id: conversation.id,
        user_id: currentUser.id
      })

    if (selfMemberError) {
      throw new Error(getErrorMessage(selfMemberError, 'Impossible de créer les participants'))
    }

    const { error: targetMemberError } = await supabase
      .from('conversation_participants')
      .insert({
        conversation_id: conversation.id,
        user_id: targetUserId
      })

    if (targetMemberError) {
      throw new Error(getErrorMessage(targetMemberError, 'Impossible de créer les participants'))
    }

    return conversation.id
  },

  sendMessage: async (conversationId, content) => {
    const currentUser = await getCurrentAuthUser()
    const messageContent = content?.trim()

    if (!messageContent) {
      throw new Error('Message vide')
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        author_id: currentUser.id,
        content: messageContent
      })
      .select(
        `
          id,
          conversation_id,
          author_id,
          content,
          created_at,
          profiles:author_id (id, username, name, avatar)
        `
      )
      .single()

    if (error) {
      throw new Error(getErrorMessage(error, 'Impossible d envoyer le message'))
    }

    return normalizeMessage(data)
  }
}
