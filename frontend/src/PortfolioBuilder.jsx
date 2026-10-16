import { useState } from 'react'
import { ArrowLeft, Camera, Eye, Upload } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import './PortfolioBuilder.css'

const MINIMAL_PORTFOLIO_KEY = 'ptech_minimal_portfolio'

const initialProfile = {
  name: '',
  headline: '',
  introduction: '',
  about: '',
  skills: '',
  education: '',
  projects: '',
  email: '',
  phone: '',
  location: '',
  website: '',
}

function loadDraft() {
  const raw = sessionStorage.getItem(MINIMAL_PORTFOLIO_KEY)
  if (!raw) return { profile: initialProfile, photo: '' }

  try {
    const saved = JSON.parse(raw)
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return { profile: initialProfile, photo: '' }

    return {
      profile: Object.fromEntries(
        Object.keys(initialProfile).map((field) => [field, typeof saved[field] === 'string' ? saved[field] : '']),
      ),
      photo: typeof saved.photo === 'string' ? saved.photo : '',
    }
  } catch {
    return { profile: initialProfile, photo: '' }
  }
}

function PortfolioBuilder() {
  const location = useLocation()
  const navigate = useNavigate()
  const template = location.state?.template ?? 'Minimal'
  const [draft] = useState(loadDraft)
  const [profile, setProfile] = useState(draft.profile)
  const [photo, setPhoto] = useState(draft.photo)
  const [photoError, setPhotoError] = useState('')
  const [saveError, setSaveError] = useState('')

  function updateProfile(event) {
    const { name, value } = event.target
    setProfile((current) => ({ ...current, [name]: value }))
  }

  function handlePhotoChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setPhotoError('Choose an image file to use as your profile photo.')
      event.target.value = ''
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Choose an image smaller than 5 MB.')
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhoto(reader.result)
        setPhotoError('')
      } else {
        setPhotoError('This image could not be loaded. Please choose another file.')
      }
    }
    reader.onerror = () => setPhotoError('This image could not be read. Please choose another file.')
    reader.readAsDataURL(file)
  }

  function handleSubmit(event) {
    event.preventDefault()
    try {
      sessionStorage.setItem(MINIMAL_PORTFOLIO_KEY, JSON.stringify({ ...profile, photo }))
      navigate('/portfolio/minimal')
    } catch {
      setSaveError('Your portfolio could not be saved in this browser. Remove a large image or check available storage, then try again.')
    }
  }

  return (
    <main className="builder-page">
      <header className="builder-header">
        <Link className="builder-back" to="/#templates"><ArrowLeft size={17} /> Back to templates</Link>
        <span className="builder-template">{template} template</span>
      </header>

      <div className="builder-heading">
        <p className="builder-kicker">Your portfolio, your story</p>
        <h1>Make it yours.</h1>
        <p>Enter your details, then open a separate page to see your finished portfolio.</p>
      </div>

      <div className="builder-layout builder-layout--form-only">
        <form className="builder-form" onSubmit={handleSubmit}>
          <section className="builder-form-section" aria-labelledby="builder-profile-title" data-scroll-reveal>
            <div className="builder-section-heading">
              <span>01</span>
              <h2 id="builder-profile-title">Profile & introduction</h2>
            </div>
            <label className="builder-photo-upload">
              <span className="builder-photo-icon"><Camera size={18} /></span>
              <span><strong>Profile photo</strong><small>JPG, PNG, or GIF · up to 5 MB</small></span>
              <span className="builder-upload-action"><Upload size={15} /> Choose</span>
              <input type="file" accept="image/*" onChange={handlePhotoChange} />
            </label>
            {photoError && <p className="builder-error" role="alert">{photoError}</p>}
            <div className="builder-fields">
              <label className="builder-field">
                <span>Your name</span>
                <input name="name" value={profile.name} onChange={updateProfile} placeholder="e.g. Alex Morgan" />
              </label>
              <label className="builder-field">
                <span>Professional title</span>
                <input name="headline" value={profile.headline} onChange={updateProfile} placeholder="e.g. Product designer" />
              </label>
              <label className="builder-field builder-field--full">
                <span>Short introduction</span>
                <textarea name="introduction" value={profile.introduction} onChange={updateProfile} placeholder="A few words to introduce yourself..." rows="3" />
              </label>
            </div>
          </section>

          <section className="builder-form-section" aria-labelledby="builder-about-title" data-scroll-reveal>
            <div className="builder-section-heading">
              <span>02</span>
              <h2 id="builder-about-title">About me</h2>
            </div>
            <label className="builder-field">
              <span>Your story</span>
              <textarea name="about" value={profile.about} onChange={updateProfile} placeholder="Share your background, what you care about, and what you do..." rows="5" />
            </label>
          </section>

          <section className="builder-form-section" aria-labelledby="builder-skills-title" data-scroll-reveal>
            <div className="builder-section-heading">
              <span>03</span>
              <h2 id="builder-skills-title">Skills</h2>
            </div>
            <label className="builder-field">
              <span>Your skills <small>Separate each skill with a comma or a new line.</small></span>
              <textarea name="skills" value={profile.skills} onChange={updateProfile} placeholder={'e.g. UI design, Prototyping\nFigma, User research'} rows="3" />
            </label>
          </section>

          <section className="builder-form-section" aria-labelledby="builder-education-title" data-scroll-reveal>
            <div className="builder-section-heading">
              <span>04</span>
              <h2 id="builder-education-title">Education</h2>
            </div>
            <label className="builder-field">
              <span>Education details <small>One school, degree, or qualification per line.</small></span>
              <textarea name="education" value={profile.education} onChange={updateProfile} placeholder={'e.g. B.A. Graphic Design — North University, 2022'} rows="3" />
            </label>
          </section>

          <section className="builder-form-section" aria-labelledby="builder-projects-title" data-scroll-reveal>
            <div className="builder-section-heading">
              <span>05</span>
              <h2 id="builder-projects-title">Projects</h2>
            </div>
            <label className="builder-field">
              <span>Selected projects <small>One project per line. Add its name and a short description.</small></span>
              <textarea name="projects" value={profile.projects} onChange={updateProfile} placeholder={'e.g. Studio North — Brand identity and responsive website'} rows="4" />
            </label>
          </section>

          <section className="builder-form-section" aria-labelledby="builder-contact-title" data-scroll-reveal>
            <div className="builder-section-heading">
              <span>06</span>
              <h2 id="builder-contact-title">Contact information</h2>
            </div>
            <div className="builder-fields">
              <label className="builder-field">
                <span>Email</span>
                <input type="email" name="email" value={profile.email} onChange={updateProfile} placeholder="you@example.com" />
              </label>
              <label className="builder-field">
                <span>Phone</span>
                <input type="tel" name="phone" value={profile.phone} onChange={updateProfile} placeholder="+1 555 000 0000" />
              </label>
              <label className="builder-field">
                <span>Location</span>
                <input name="location" value={profile.location} onChange={updateProfile} placeholder="City, Country" />
              </label>
              <label className="builder-field">
                <span>Website</span>
                <input name="website" value={profile.website} onChange={updateProfile} placeholder="yourwebsite.com" />
              </label>
            </div>
          </section>
          {saveError && <p className="builder-error builder-save-error" role="alert">{saveError}</p>}
          <div className="builder-publish-row">
            <p>Your details are saved in this browser tab and shown on a separate page.</p>
            <button type="submit"><Eye size={16} /> View my portfolio</button>
          </div>
        </form>
      </div>
    </main>
  )
}

export default PortfolioBuilder
