import { useState } from 'react'
import {
  ArrowDown,
  BriefcaseBusiness,
  Check,
  FileText,
  Globe2,
  Layers3,
  Menu,
  Palette,
  UserRound,
  WandSparkles,
  X,
} from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { authApi } from './api/auth.js'

const features = [
  {
    icon: UserRound,
    title: 'Personal profile',
    text: 'Tell your story with a profile that feels like you.',
  },
  {
    icon: Palette,
    title: 'Creative templates',
    text: 'Choose a considered layout for your own style.',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Skills & experience',
    text: 'Bring your best work and experience together.',
  },
  {
    icon: FileText,
    title: 'Professional CV',
    text: 'Make your strengths easy to discover.',
  },
  {
    icon: WandSparkles,
    title: 'Easy to customize',
    text: 'Make every detail your own, with no fuss.',
  },
  {
    icon: Globe2,
    title: 'Online portfolio',
    text: 'Share your work with one simple link.',
  },
]

const templates = [
  {
    name: 'Minimal',
    kind: 'minimal',
    description: 'A clean, simple design that puts your profile and work first.',
  },
  {
    name: 'Creative',
    kind: 'creative',
    description: 'A colorful canvas for your creativity, projects, and personality.',
  },
  {
    name: 'Professional',
    kind: 'professional',
    description: 'A polished layout for your experience, achievements, and career.',
  },
]

function TemplateArtwork({ kind }) {
  return (
    <div className={`template-art template-art--${kind}`} aria-hidden="true">
      <div className="art-topbar">
        <span />
        <span />
        <span />
      </div>
      <div className="art-layout">
        <div className="art-sidebar">
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="art-main">
          <div className="art-cover">
            <span />
            <span />
          </div>
          <div className="art-lines">
            <i />
            <i />
            <i />
          </div>
          <div className="art-cards">
            <i />
            <i />
            <i />
          </div>
          <div className="art-lines art-lines--short">
            <i />
            <i />
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [previewTemplate, setPreviewTemplate] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [signedIn, setSignedIn] = useState(Boolean(authApi.getToken()))
  const location = useLocation()
  const [authNotice, setAuthNotice] = useState(location.state?.authNotice ?? '')

  const closeMenu = () => setMenuOpen(false)

  async function handleLogout() {
    try {
      await authApi.logout()
      setSignedIn(false)
      setAuthNotice('You have been logged out.')
    } catch {
      setSignedIn(false)
      setAuthNotice('Your local session ended, but the server could not confirm logout. Please check your connection.')
    }
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#08090c] text-white">
      <header className="site-header">
        <a className="brand" href="#home" aria-label="Ptech home" onClick={closeMenu}>
          <img src="/assets/small-logo.png" alt="" />
          <span className="brand-name">Ptech</span>
          <span className="brand-divider" />
          <span className="brand-caption">Technologies</span>
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <nav className={`site-nav${menuOpen ? ' site-nav--open' : ''}`} aria-label="Main navigation">
          <a href="#home" onClick={closeMenu}>Home</a>
          <a href="#templates" onClick={closeMenu}>Templates</a>
          {signedIn ? (
            <button className="nav-button nav-button--dark" type="button" onClick={handleLogout}>Log out</button>
          ) : (
            <>
              <a href="/login" onClick={closeMenu}>Login</a>
              <a className="nav-button nav-button--dark" href="/register" onClick={closeMenu}>Register</a>
            </>
          )}
          <a className="nav-button nav-button--light" href="#templates" onClick={closeMenu}>Get started</a>
          <a href="#contact" onClick={closeMenu}>Contact</a>
        </nav>
      </header>

      <main>
        {authNotice && (
          <p className="auth-success" role="status">{authNotice}</p>
        )}
        <section id="home" className="hero-section">
          <div className="hero-copy">
            <p className="eyebrow">Your next chapter starts here</p>
            <h1>Make your work<br />impossible to ignore.</h1>
            <p className="hero-description">
              Create a thoughtful online portfolio that brings your best work,
              experience, and ideas together.
            </p>
            <a className="primary-button" href="#templates">
              Explore templates <ArrowDown size={15} />
            </a>
            <p className="hero-note">A little space for everything you do best.</p>
          </div>
          <div className="hero-visual" aria-label="Portfolio website preview">
            <div className="visual-orbit visual-orbit--outer" />
            <div className="visual-orbit visual-orbit--inner" />
            <div className="portfolio-window">
              <div className="window-bar"><span /><span /><span /><i /></div>
              <div className="window-content">
                <div className="window-intro">
                  <span className="window-kicker">INDEPENDENT DESIGNER</span>
                  <strong>Ideas made<br />to move people.</strong>
                  <i />
                  <i />
                  <div className="window-link">Selected work&nbsp; ↗</div>
                </div>
                <div className="window-image">
                  <div className="window-image-shape" />
                  <span>01 / 04</span>
                </div>
                <div className="window-bottom"><i /><i /><i /><i /></div>
              </div>
            </div>
            <div className="visual-tag"><Layers3 size={15} /> YOUR WORK, WELL PRESENTED</div>
          </div>
          <div className="hero-scroll" aria-hidden="true"><span /> SCROLL TO EXPLORE</div>
        </section>

        <section className="features-section" aria-labelledby="features-title">
          <div className="section-heading">
            <p className="eyebrow">A portfolio that works for you</p>
            <h2 id="features-title">Everything you need.<br /><span>Nothing you don’t.</span></h2>
          </div>
          <div className="feature-grid">
            {features.map(({ icon: Icon, title, text }, index) => (
              <article className="feature-card" key={title}>
                <div className="feature-icon"><Icon size={20} strokeWidth={1.65} /></div>
                <span className="feature-number">0{index + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="templates" className="templates-section" aria-labelledby="templates-title">
          <div className="templates-heading">
            <div>
              <p className="eyebrow">Find your point of view</p>
              <h2 id="templates-title">A style that feels like <span>you.</span></h2>
            </div>
            <p>Start with a layout. Make it yours.</p>
          </div>
          <div className="template-grid">
            {templates.map((template) => {
              const isSelected = selectedTemplate === template.name

              return (
                <article className={`template-card${isSelected ? ' template-card--selected' : ''}`} key={template.name}>
                  <div className="template-art-wrap">
                    <TemplateArtwork kind={template.kind} />
                  </div>
                  <div className="template-details">
                    <div className="template-title-row">
                      <h3>{template.name}</h3>
                      {isSelected && <span className="selected-label"><Check size={12} /> Selected</span>}
                    </div>
                    <p>{template.description}</p>
                    <div className="template-actions">
                      <button type="button" className="preview-button" onClick={() => setPreviewTemplate(template.name)}>
                        Preview
                      </button>
                      <button
                        type="button"
                        className="select-button"
                        aria-pressed={isSelected}
                        onClick={() => setSelectedTemplate(template.name)}
                      >
                        {isSelected ? 'Selected' : 'Choose style'}
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </main>

      <footer id="contact" className="site-footer">
        <div className="footer-main">
          <div className="footer-about">
            <p className="footer-label">A little about us</p>
            <p>Ptech helps people put their work in the right light. Build a portfolio that feels considered, personal, and ready to share.</p>
          </div>
          <div className="footer-brand-block">
            <img src="/assets/big-logo.png" alt="Ptech Technologies" />
            <p>Thoughtful tools for your next chapter.</p>
          </div>
          <div className="footer-contact">
            <p className="footer-label">Say hello</p>
            <a href="mailto:hello@ptech.example">hello@ptech.example</a>
            <a href="#home">Back to the top ↑</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Ptech Technologies</span>
          <span>Make good things. Share them well.</span>
        </div>
      </footer>

      {previewTemplate && (
        <div className="preview-backdrop" role="presentation" onClick={() => setPreviewTemplate('')}>
          <section
            className="preview-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="preview-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button className="preview-close" type="button" aria-label="Close preview" onClick={() => setPreviewTemplate('')}>
              <X size={19} />
            </button>
            <p className="eyebrow">Template preview</p>
            <h2 id="preview-title">{previewTemplate}</h2>
            <TemplateArtwork kind={templates.find((template) => template.name === previewTemplate)?.kind ?? 'minimal'} />
            <button
              type="button"
              className="select-button"
              onClick={() => {
                setSelectedTemplate(previewTemplate)
                setPreviewTemplate('')
              }}
            >
              Choose this style
            </button>
          </section>
        </div>
      )}
    </div>
  )
}

export default App
