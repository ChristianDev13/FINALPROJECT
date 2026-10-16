import { apiRequest, authApi } from './auth.js'

function authenticatedRequest(path, options = {}) {
  const token = authApi.getToken()
  if (!token) {
    const error = new Error('Please log in to access your account.')
    error.status = 401
    throw error
  }

  return apiRequest(path, { ...options, token })
}

export const accountApi = {
  async updateAccount(account) {
    const data = await authenticatedRequest('/account', {
      method: 'PATCH',
      body: JSON.stringify(account),
    })
    return data.user
  },

  async updatePassword(passwords) {
    return authenticatedRequest('/account/password', {
      method: 'PUT',
      body: JSON.stringify(passwords),
    })
  },

  async updatePreferences(preferences) {
    const data = await authenticatedRequest('/account/preferences', {
      method: 'PATCH',
      body: JSON.stringify({ preferences }),
    })
    return data.preferences
  },

  async getTemplateHistory() {
    const data = await authenticatedRequest('/template-history')
    return data.history
  },

  async selectTemplate(templateSlug) {
    const data = await authenticatedRequest('/template-history', {
      method: 'POST',
      body: JSON.stringify({ template_slug: templateSlug }),
    })
    return data.history
  },

  async deleteTemplateHistory(id) {
    return authenticatedRequest(`/template-history/${id}`, { method: 'DELETE' })
  },

  async getPortfolios() {
    const data = await authenticatedRequest('/my-portfolios')
    return data.portfolios.map((portfolio) => ({
      ...portfolio,
      data: typeof portfolio.data === 'string' ? JSON.parse(portfolio.data) : portfolio.data,
    }))
  },

  async savePortfolio(templateSlug, portfolio) {
    const data = await authenticatedRequest(`/my-portfolios/${templateSlug}`, {
      method: 'PUT',
      body: JSON.stringify({ data: portfolio }),
    })
    return data.portfolio
  },

  async deletePortfolio(id) {
    return authenticatedRequest(`/my-portfolios/${id}`, { method: 'DELETE' })
  },
}
