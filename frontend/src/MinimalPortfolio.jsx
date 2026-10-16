import { useState } from 'react'
import { ArrowLeft, Camera, Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import './MinimalPortfolio.css'

const MINIMAL_PORTFOLIO_KEY = 'ptech_minimal_portfolio'
const currentYear = new Date().getFullYear()

function loadPortfolio() {
  const saved = sessionStorage.getItem(MINIMAL_PORTFOLIO_KEY)
  if (!saved) return { portfolio: null, error: '' }

  try {
    const portfolio = JSON.parse(saved)
    if (
      !portfolio
      || typeof portfolio !== 'object'
      || Array.isArray(portfolio)
      || ['name', 'headline', 'introduction', 'about', 'skills', 'education', 'projects', 'email', 'phone', 'location', 'website', 'photo']
        .some((field) => portfolio[field] !== undefined && typeof portfolio[field] !== 'string')
    ) {
      throw new Error('Saved portfolio data is not valid.')
    }
    return { portfolio, error: '' }
  } catch {
    return { portfolio: null, error: 'Your saved portfolio could not be opened. Return to the editor and create it again.' }
  }
}

function splitItems(value = '') {
  return value.split(/\n|,/).map((item) => item.trim()).filter(Boolean)
}

function MinimalPortfolio() {
  const [saved] = useState(loadPortfolio)
  const { portfolio, error } = saved

  if (!portfolio) {
    return (
      <main className="minimal-empty-state">
        <h1>{error ? 'Portfolio unavailable' : 'Your portfolio is waiting.'}</h1>
        <p>{error || 'Add your details in the editor to see your portfolio here.'}</p>
        <Link to="/create"><ArrowLeft size={16} /> Open portfolio editor</Link>
      </main>
    )
  }

  const skills = splitItems(portfolio.skills)
  const education = splitItems(portfolio.education)
  const projects = splitItems(portfolio.projects)

  return (
    <main className="minimal-portfolio-page">
      <header className="minimal-portfolio-header" data-sticky-nav>
        <a className="minimal-portfolio-brand" href="#top">{portfolio.name || 'Portfolio'}</a>
        <nav aria-label="Portfolio sections">
          <a href="#about">About</a>
          <a href="#skills">Skills</a>
          <a href="#education">Education</a>
          <a href="#projects">Projects</a>
          <a href="#contact">Contact</a>
        </nav>
        <Link className="minimal-edit-link" to="/create"><ArrowLeft size={15} /> Edit portfolio</Link>
      </header>

      <article className="minimal-portfolio-content" id="top">
        <section className="minimal-output-hero" data-scroll-reveal>
          {portfolio.photo
            ? <img className="minimal-output-photo" src={portfolio.photo} alt={portfolio.name ? `${portfolio.name}'s profile` : 'Profile'} />
            : <div className="minimal-output-photo minimal-output-photo--empty" aria-hidden="true"><Camera size={26} /></div>}
          <p className="minimal-output-eyebrow">PORTFOLIO</p>
          <h1>{portfolio.name || 'Your name'}</h1>
          <p className="minimal-output-headline">{portfolio.headline || 'Your professional title'}</p>
          {portfolio.introduction && <p className="minimal-output-intro">{portfolio.introduction}</p>}
        </section>

        <section className="minimal-output-section" id="about" data-scroll-reveal>
          <h2>About me</h2>
          <p>{portfolio.about || 'Add a little about yourself in the editor.'}</p>
        </section>

        <section className="minimal-output-section" id="skills" data-scroll-reveal>
          <h2>Skills</h2>
          {skills.length
            ? <ul className="minimal-output-tags">{skills.map((skill, index) => <li key={`${skill}-${index}`}>{skill}</li>)}</ul>
            : <p className="minimal-output-muted">Add your skills in the editor.</p>}
        </section>

        <section className="minimal-output-section" id="education" data-scroll-reveal>
          <h2>Education</h2>
          {education.length
            ? <ul>{education.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>
            : <p className="minimal-output-muted">Add your education in the editor.</p>}
        </section>

        <section className="minimal-output-section" id="projects" data-scroll-reveal>
          <h2>Projects</h2>
          {projects.length
            ? <ul>{projects.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>
            : <p className="minimal-output-muted">Add your projects in the editor.</p>}
        </section>

        <section className="minimal-output-section minimal-output-contact" id="contact" data-scroll-reveal>
          <h2>Contact</h2>
          {portfolio.email && <a href={`mailto:${portfolio.email}`}><Mail size={16} />{portfolio.email}</a>}
          {portfolio.phone && <a href={`tel:${portfolio.phone}`}><Phone size={16} />{portfolio.phone}</a>}
          {portfolio.location && <p><MapPin size={16} />{portfolio.location}</p>}
          {portfolio.website && <p>{portfolio.website}</p>}
          {!portfolio.email && !portfolio.phone && !portfolio.location && !portfolio.website && (
            <p className="minimal-output-muted">Add your contact details in the editor.</p>
          )}
        </section>
      </article>

      <footer className="minimal-portfolio-footer" data-scroll-reveal>
        <span>© {currentYear} {portfolio.name || 'Your name'}</span>
        <Link to="/create">Edit portfolio</Link>
      </footer>
    </main>
  )
}

export default MinimalPortfolio
