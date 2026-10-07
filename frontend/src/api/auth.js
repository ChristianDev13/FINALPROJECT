const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
const TOKEN_KEY = 'ptech_auth_token'

async function request(path, { token, ...options } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
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
    throw new Error(validationErrors || data.message || 'Something went wrong. Please try again.')
  }

  return data
}

export const authApi = {
  async register({ name, email, password, password_confirmation }) {
    const data = await request('/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, password_confirmation }),
    })
    sessionStorage.setItem(TOKEN_KEY, data.token)
    return data.user
  },

  async login({ email, password }) {
    const data = await request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    sessionStorage.setItem(TOKEN_KEY, data.token)
    return data.user
  },

  async logout() {
    const token = sessionStorage.getItem(TOKEN_KEY)
    try {
      if (token) {
        await request('/logout', { method: 'POST', token })
      }
    } finally {
      sessionStorage.removeItem(TOKEN_KEY)
    }
  },

  getToken() {
    return sessionStorage.getItem(TOKEN_KEY)
  },
}
