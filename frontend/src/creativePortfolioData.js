export const CREATIVE_PORTFOLIO_KEY = 'ptech_creative_portfolio'

export const initialCreativePortfolio = {
  name: '',
  role: '',
  introduction: '',
  about: '',
  skills: '',
  email: '',
  projects: [{ title: '', description: '', image: '' }],
  socials: {
    instagram: '',
    facebook: '',
    linkedin: '',
  },
}

export function safeWebUrl(value) {
  if (!value.trim()) return ''

  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : ''
  } catch {
    return ''
  }
}

export function safeImageSource(value) {
  if (typeof value !== 'string') return ''
  if (/^data:image\/(?:jpeg|png);base64,[A-Za-z0-9+/]+={0,2}$/.test(value)) return value
  return safeWebUrl(value)
}
