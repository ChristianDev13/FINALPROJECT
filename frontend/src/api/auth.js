const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
const TOKEN_KEY = 'ptech_auth_token'

async function fetchApi(url, options) {
  try {
    return await fetch(url, options)
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Can't connect to the portfolio API at ${API_URL}. Start the Laravel API and make sure its database is available, then try again.`)
    }
    throw error
  }
}

export async function apiRequest(path, { token, ...options } = {}) {
  const response = await fetchApi(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error(response.ok
      ? 'The server returned an invalid response.'
      : `The server returned an error (${response.status}).`)
  }

  const data = await response.json()

  if (!response.ok) {
    const validationErrors = data.errors
      ? Object.values(data.errors).flat().join(' ')
      : null
    const error = new Error(validationErrors || data.message || 'Something went wrong. Please try again.')
    error.status = response.status
    throw error
  }

  return data
}

export const authApi = {
  async register({ name, email, password, password_confirmation }) {
    const data = await apiRequest('/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, password_confirmation }),
    })
    sessionStorage.removeItem(TOKEN_KEY)
    return data.user
  },

  async login({ email, password }) {
    const data = await apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    sessionStorage.setItem(TOKEN_KEY, data.token)
    return data.user
  },

  async requestPasswordReset(email) {
    const data = await apiRequest('/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
    return data.message
  },

  async resetPassword({ email, token, password, password_confirmation }) {
    const data = await apiRequest('/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, token, password, password_confirmation }),
    })
    return data.message
  },

  async logout() {
    const token = sessionStorage.getItem(TOKEN_KEY)
    try {
      if (token) {
        await apiRequest('/logout', { method: 'POST', token })
      }
    } finally {
      sessionStorage.removeItem(TOKEN_KEY)
    }
  },

  async getCurrentUser() {
    const token = sessionStorage.getItem(TOKEN_KEY)
    if (!token) return null

    try {
      const data = await apiRequest('/user', { token })
      return data.user
    } catch (error) {
      if (error.status === 401) sessionStorage.removeItem(TOKEN_KEY)
      throw error
    }
  },

  getToken() {
    return sessionStorage.getItem(TOKEN_KEY)
  },
}
