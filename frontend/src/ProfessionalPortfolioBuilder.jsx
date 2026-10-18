import { useState } from 'react'
import { ArrowLeft, ArrowUpRight, BriefcaseBusiness, Plus, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { initialProfessionalPortfolio, PROFESSIONAL_PORTFOLIO_KEY } from './professionalPortfolioData.js'
import { accountApi } from './api/account.js'
import { authApi } from './api/auth.js'
import './ProfessionalPortfolio.css'

function loadDraft() {
  const saved = sessionStorage.getItem(PROFESSIONAL_PORTFOLIO_KEY)
  if (!saved) return { portfolio: initialProfessionalPortfolio, error: '' }

  try {
    const parsed = JSON.parse(saved)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Saved portfolio data is not valid.')
    }

    const textFields = Object.keys(initialProfessionalPortfolio).filter((field) => field !== 'experience')
    return {
      portfolio: {
        ...Object.fromEntries(textFields.map((field) => [
          field,
          typeof parsed[field] === 'string' ? parsed[field] : initialProfessionalPortfolio[field],
        ])),
        experience: Array.isArray(parsed.experience) && parsed.experience.length
          ? parsed.experience
            .filter((entry) => entry && typeof entry === 'object' && !Array.isArray(entry))
            .map((entry) => Object.fromEntries(
              ['role', 'company', 'dates', 'details'].map((field) => [
                field,
                typeof entry[field] === 'string' ? entry[field] : '',
              ]),
            ))
          : initialProfessionalPortfolio.experience,
      },
      error: '',
    }
  } catch {
    return {
      portfolio: initialProfessionalPortfolio,
      error: 'Your previous draft could not be loaded. You can enter your details again.',
    }
  }
}

function ProfessionalPortfolioBuilder() {
  const navigate = useNavigate()
  const [draft] = useState(loadDraft)
  const [portfolio, setPortfolio] = useState(draft.portfolio)
  const [saveError, setSaveError] = useState(draft.error)
  const [saving, setSaving] = useState(false)

  function updateField(event) {
    const { name, value } = event.target
    setPortfolio((current) => ({ ...current, [name]: value }))
  }

  function updateExperience(index, key, value) {
    setPortfolio((current) => ({
      ...current,
      experience: current.experience.map((entry, entryIndex) => (
        entryIndex === index ? { ...entry, [key]: value } : entry
      )),
    }))
  }

  function addExperience() {
    setPortfolio((current) => ({
      ...current,
      experience: [...current.experience, { role: '', company: '', dates: '', details: '' }],
    }))
  }

  function removeExperience(index) {
    setPortfolio((current) => ({
      ...current,
      experience: current.experience.filter((_, entryIndex) => entryIndex !== index),
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaveError('')
    try {
      sessionStorage.setItem(PROFESSIONAL_PORTFOLIO_KEY, JSON.stringify(portfolio))
    } catch {
      setSaveError('Your portfolio could not be saved in this browser. Check available storage and try again.')
      return
    }

    if (authApi.getToken()) {
      setSaving(true)
      try {
        await accountApi.savePortfolio('professional', portfolio)
      } catch (error) {
        setSaveError(`Your browser draft was saved, but your account portfolio could not be saved: ${error.message}`)
        setSaving(false)
        return
      }
    }
    navigate('/portfolio/professional')
  }

  return (
    <main className="professional-builder-page">
      <header className="professional-builder-header" data-sticky-nav>
        <Link to="/#templates"><ArrowLeft size={16} /> Templates</Link>
        <span><BriefcaseBusiness size={16} /> Professional portfolio</span>
        <Link to="/portfolio/professional">View portfolio <ArrowUpRight size={15} /></Link>
      </header>

      <div className="professional-builder-intro" data-scroll-reveal>
        <p>YOUR EXPERIENCE, WELL PRESENTED</p>
        <h1>Make your next move<br /><span>stand out.</span></h1>
        <div>Build a polished professional profile with a separate, shareable portfolio page.</div>
      </div>

      <form className="professional-builder-form" onSubmit={handleSubmit}>
        <section className="professional-input-section" data-scroll-reveal>
          <div className="professional-input-heading"><span>01</span><div><h2>Professional profile</h2><p>Start with your name, current role, and contact details.</p></div></div>
          <div className="professional-form-grid">
            <label className="professional-field"><span>Full name</span><input name="name" value={portfolio.name} onChange={updateField} placeholder="e.g. Morgan Chen" /></label>
            <label className="professional-field"><span>Job title</span><input name="title" value={portfolio.title} onChange={updateField} placeholder="e.g. Senior Software Engineer" /></label>
            <label className="professional-field"><span>Location</span><input name="location" value={portfolio.location} onChange={updateField} placeholder="City, Country" /></label>
            <label className="professional-field"><span>Email</span><input type="email" name="email" value={portfolio.email} onChange={updateField} placeholder="you@example.com" /></label>
            <label className="professional-field"><span>Phone</span><input type="tel" name="phone" value={portfolio.phone} onChange={updateField} placeholder="+1 555 000 0000" /></label>
            <label className="professional-field"><span>Website</span><input name="website" value={portfolio.website} onChange={updateField} placeholder="yourwebsite.com" /></label>
          </div>
        </section>

        <section className="professional-input-section" data-scroll-reveal>
          <div className="professional-input-heading"><span>02</span><div><h2>Career summary</h2><p>Highlight your strengths, experience, and professional focus.</p></div></div>
          <label className="professional-field"><span>Summary</span><textarea name="summary" value={portfolio.summary} onChange={updateField} rows="5" placeholder="Write a concise overview of your career and the value you bring..." /></label>
        </section>

        <section className="professional-input-section" data-scroll-reveal>
          <div className="professional-input-heading"><span>03</span><div><h2>Work experience</h2><p>Add your roles, employers, dates, and key contributions.</p></div></div>
          <div className="professional-experience-inputs">
            {portfolio.experience.map((entry, index) => (
              <div className="professional-experience-card" key={index}>
                {portfolio.experience.length > 1 && (
                  <button className="professional-remove-button" type="button" onClick={() => removeExperience(index)} aria-label={`Remove experience ${index + 1}`}>
                    <Trash2 size={14} /> Remove
                  </button>
                )}
                <label className="professional-field"><span>Job title</span><input value={entry.role} onChange={(event) => updateExperience(index, 'role', event.target.value)} placeholder="e.g. Product Manager" /></label>
                <label className="professional-field"><span>Company</span><input value={entry.company} onChange={(event) => updateExperience(index, 'company', event.target.value)} placeholder="e.g. Northstar Labs" /></label>
                <label className="professional-field professional-field--full"><span>Dates</span><input value={entry.dates} onChange={(event) => updateExperience(index, 'dates', event.target.value)} placeholder="e.g. March 2022 – Present" /></label>
                <label className="professional-field professional-field--full"><span>Responsibilities and impact</span><textarea value={entry.details} onChange={(event) => updateExperience(index, 'details', event.target.value)} rows="3" placeholder="Describe your contributions and measurable results..." /></label>
              </div>
            ))}
          </div>
          <button className="professional-add-button" type="button" onClick={addExperience}><Plus size={16} /> Add work experience</button>
        </section>

        <section className="professional-input-section" data-scroll-reveal>
          <div className="professional-input-heading"><span>04</span><div><h2>Skills</h2><p>List each skill separated by a comma or a new line.</p></div></div>
          <div className="professional-form-grid">
            <label className="professional-field"><span>Technical skills</span><textarea name="technicalSkills" value={portfolio.technicalSkills} onChange={updateField} rows="4" placeholder={'e.g. JavaScript, SQL\nCloud infrastructure, Data analysis'} /></label>
            <label className="professional-field"><span>Professional skills</span><textarea name="professionalSkills" value={portfolio.professionalSkills} onChange={updateField} rows="4" placeholder={'e.g. Leadership, Communication\nStrategic planning, Mentoring'} /></label>
          </div>
        </section>

        <section className="professional-input-section" data-scroll-reveal>
          <div className="professional-input-heading"><span>05</span><div><h2>Education & certifications</h2><p>Add one degree, qualification, or certification per line.</p></div></div>
          <div className="professional-form-grid">
            <label className="professional-field"><span>Education</span><textarea name="education" value={portfolio.education} onChange={updateField} rows="4" placeholder={'e.g. B.S. Computer Science — Westlake University, 2020'} /></label>
            <label className="professional-field"><span>Certifications</span><textarea name="certifications" value={portfolio.certifications} onChange={updateField} rows="4" placeholder={'e.g. AWS Certified Solutions Architect, 2023'} /></label>
          </div>
        </section>

        <section className="professional-input-section" data-scroll-reveal>
          <div className="professional-input-heading"><span>06</span><div><h2>Achievements</h2><p>Share awards, milestones, and notable results.</p></div></div>
          <label className="professional-field"><span>Achievements <small>One achievement per line.</small></span><textarea name="achievements" value={portfolio.achievements} onChange={updateField} rows="4" placeholder={'e.g. Led platform migration, reducing deployment time by 40%'} /></label>
        </section>

        {saveError && <p className="professional-form-error professional-save-error" role="alert">{saveError}</p>}
        <div className="professional-submit-row">
          <p>Your information stays in this browser tab. Create your portfolio to preview the separate output page.</p>
          <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Create my portfolio'} <ArrowUpRight size={16} /></button>
        </div>
      </form>
    </main>
  )
}

export default ProfessionalPortfolioBuilder
