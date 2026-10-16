export const PROFESSIONAL_PORTFOLIO_KEY = 'ptech_professional_portfolio'

export const initialProfessionalPortfolio = {
  name: '',
  title: '',
  location: '',
  email: '',
  phone: '',
  website: '',
  summary: '',
  experience: [{ role: '', company: '', dates: '', details: '' }],
  technicalSkills: '',
  professionalSkills: '',
  education: '',
  certifications: '',
  achievements: '',
  cv: '',
  cvName: '',
}

export function splitProfessionalItems(value = '') {
  return value.split(/\n|,/).map((item) => item.trim()).filter(Boolean)
}
