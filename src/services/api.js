const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

async function handleResponse(response) {
  let payload = null

  try {
    payload = await response.json()
  } catch (_) {
    // ignore JSON parse errors, will fall back to status text
  }

  if (!response.ok) {
    const message = payload?.message || response.statusText || 'Erreur API'
    throw new Error(message)
  }

  return payload
}

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token')

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
  return handleResponse(response)
}

export const authAPI = {
  login: (credentials) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

  register: (userData) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),

  getCurrentUser: () => apiRequest('/auth/me')
}

export const postsAPI = {
  getAll: () => apiRequest('/posts'),

  getById: (id) => apiRequest(`/posts/${id}`),

  create: (postData) =>
    apiRequest('/posts', {
      method: 'POST',
      body: JSON.stringify(postData)
    }),

  delete: (id) =>
    apiRequest(`/posts/${id}`, {
      method: 'DELETE'
    })

  ,

  toggleLike: (id) =>
    apiRequest(`/posts/${id}/like`, {
      method: 'POST'
    })
}
