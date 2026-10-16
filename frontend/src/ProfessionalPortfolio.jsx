import { useState } from 'react'
import { ArrowDownToLine, ArrowUpRight, Award, BriefcaseBusiness, GraduationCap, Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PROFESSIONAL_PORTFOLIO_KEY, splitProfessionalItems } from './professionalPortfolioData.js'
import './ProfessionalPortfolio.css'

const currentYear = new Date().getFullYear()

function loadPortfolio() {
  const saved = sessionStorage.getItem(PROFESSIONAL_PORTFOLIO_KEY)
  if (!saved) return { portfolio: null, error: '' }

  try {
    const portfolio = JSON.parse(saved)
    if (
      !portfolio
      || typeof portfolio !== 'object'
      || Array.isArray(portfolio)
      || (portfolio.experience !== undefined && !Array.isArray(portfolio.experience))
      || Object.entries(portfolio).some(([field, value]) => (
        field === 'experience'
          ? !Array.isArray(value) || value.some((entry) => (
            !entry
            || typeof entry !== 'object'
            || Array.isArray(entry)
            || ['role', 'company', 'dates', 'details'].some((key) => (
              entry[key] !== undefined && typeof entry[key] !== 'string'
            ))
          ))
          : typeof value !== 'string'
      ))
    ) {
      throw new Error('Saved portfolio data is not valid.')
    }
    return { portfolio, error: '' }
  } catch {
    return {
      portfolio: null,
      error: 'Your saved professional portfolio could not be opened. Return to the editor and create it again.',
    }
  }
}

function ProfessionalPortfolio() {
  const [saved] = useState(loadPortfolio)
  const { portfolio, error } = saved

  if (!portfolio) {
    return (
      <main className="professional-empty-state">
        <BriefcaseBusiness size={26} />
        <h1>{error ? 'Portfolio unavailable' : 'Your next chapter starts here.'}</h1>
        <p>{error || 'Add your career details in the professional editor to see your portfolio.'}</p>
        <Link to="/create/professional">Open professional editor <ArrowUpRight size={16} /></Link>
      </main>
    )
  }

  const experience = (Array.isArray(portfolio.experience) ? portfolio.experience : [])
    .filter((entry) => entry && typeof entry === 'object')
    .filter((entry) => [entry.role, entry.company, entry.dates, entry.details].some(Boolean))
  const technicalSkills = splitProfessionalItems(portfolio.technicalSkills)
  const professionalSkills = splitProfessionalItems(portfolio.professionalSkills)
  const education = splitProfessionalItems(portfolio.education)
  const certifications = splitProfessionalItems(portfolio.certifications)
  const achievements = splitProfessionalItems(portfolio.achievements)

  return (
    <main className="professional-portfolio-page">
      <header className="professional-portfolio-header">
        <a className="professional-portfolio-brand" href="#top">{portfolio.name || 'Professional Profile'}</a>
        <nav aria-label="Portfolio sections">
          <a href="#summary">Summary</a>
          <a href="#experience">Experience</a>
          <a href="#skills">Skills</a>
          <a href="#education">Education</a>
          <a href="#contact">Contact</a>
        </nav>
        <Link className="professional-edit-link" to="/create/professional">Edit profile</Link>
      </header>

      <article className="professional-portfolio-content" id="top">
        <section className="professional-profile-hero" data-scroll-reveal>
          <div>
            <p className="professional-eyebrow">PROFESSIONAL PROFILE</p>
            <h1>{portfolio.name || 'Your Name'}</h1>
            <p className="professional-profile-title">{portfolio.title || 'Your professional title'}</p>
            {portfolio.location && <p className="professional-profile-location"><MapPin size={15} />{portfolio.location}</p>}
          </div>
          {portfolio.cv ? (
            <a className="professional-download-button" href={portfolio.cv} download={portfolio.cvName || 'professional-cv.pdf'}>
              <ArrowDownToLine size={17} /> Download CV
            </a>
          ) : (
            <button className="professional-download-button professional-download-button--disabled" type="button" disabled title="Upload a PDF CV in the editor to enable download">
              <ArrowDownToLine size={17} /> Download CV
            </button>
          )}
        </section>

        <div className="professional-output-columns">
          <div className="professional-output-main">
            <section className="professional-output-section" id="summary" data-scroll-reveal>
              <div className="professional-output-section-title"><span>01</span><h2>Career summary</h2></div>
              <p>{portfolio.summary || 'Add a career summary in the editor to introduce your experience and professional focus.'}</p>
            </section>

            <section className="professional-output-section" id="experience" data-scroll-reveal>
              <div className="professional-output-section-title"><span>02</span><h2>Work experience</h2></div>
              {experience.length ? (
                <div className="professional-experience-list">
                  {experience.map((entry, index) => (
                    <article className="professional-experience-item" key={`${entry.company}-${entry.role}-${index}`} data-scroll-reveal>
                      <div className="professional-experience-meta">
                        {entry.role && <h3>{entry.role}</h3>}
                        <span>{entry.dates}</span>
                      </div>
                      {entry.company && <p className="professional-company">{entry.company}</p>}
                      {entry.details && <p className="professional-experience-details">{entry.details}</p>}
                    </article>
                  ))}
                </div>
              ) : <p className="professional-output-muted">Add work experience in the editor.</p>}
            </section>

            <section className="professional-output-section" id="skills" data-scroll-reveal>
              <div className="professional-output-section-title"><span>03</span><h2>Skills</h2></div>
              <div className="professional-skill-groups">
                <div><h3>Technical skills</h3>{technicalSkills.length ? <ul className="professional-skill-list">{technicalSkills.map((skill, index) => <li key={`${skill}-${index}`}>{skill}</li>)}</ul> : <p className="professional-output-muted">Add technical skills in the editor.</p>}</div>
                <div><h3>Professional skills</h3>{professionalSkills.length ? <ul className="professional-skill-list">{professionalSkills.map((skill, index) => <li key={`${skill}-${index}`}>{skill}</li>)}</ul> : <p className="professional-output-muted">Add professional skills in the editor.</p>}</div>
              </div>
            </section>

            <section className="professional-output-section" id="education" data-scroll-reveal>
              <div className="professional-output-section-title"><span>04</span><h2>Education & certifications</h2></div>
              <div className="professional-credentials-grid">
                <div><h3><GraduationCap size={16} /> Education</h3>{education.length ? <ul>{education.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul> : <p className="professional-output-muted">Add education in the editor.</p>}</div>
                <div><h3><Award size={16} /> Certifications</h3>{certifications.length ? <ul>{certifications.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul> : <p className="professional-output-muted">Add certifications in the editor.</p>}</div>
              </div>
            </section>

            <section className="professional-output-section" id="achievements" data-scroll-reveal>
              <div className="professional-output-section-title"><span>05</span><h2>Achievements</h2></div>
              {achievements.length ? <ul className="professional-achievement-list">{achievements.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul> : <p className="professional-output-muted">Add achievements in the editor.</p>}
            </section>
          </div>

          <aside className="professional-output-sidebar" data-scroll-reveal>
            <div className="professional-sidebar-heading"><BriefcaseBusiness size={17} /><h2>At a glance</h2></div>
            {portfolio.title && <p>{portfolio.title}</p>}
            {portfolio.location && <span><MapPin size={14} />{portfolio.location}</span>}
            {portfolio.email && <a href={`mailto:${portfolio.email}`}><Mail size={14} />{portfolio.email}</a>}
            {portfolio.phone && <a href={`tel:${portfolio.phone}`}><Phone size={14} />{portfolio.phone}</a>}
            {portfolio.website && <p className="professional-sidebar-website">{portfolio.website}</p>}
            {!portfolio.location && !portfolio.email && !portfolio.phone && !portfolio.website && <p className="professional-output-muted">Add contact information in the editor.</p>}
            <Link className="professional-sidebar-edit" to="/create/professional">Update this profile <ArrowUpRight size={14} /></Link>
          </aside>
        </div>
      </article>

      <footer className="professional-portfolio-footer" id="contact" data-scroll-reveal>
        <div><p>LET’S CONNECT</p><h2>Ready for what’s next.</h2></div>
        {portfolio.email && <a href={`mailto:${portfolio.email}`}><Mail size={16} /> Contact {portfolio.name || 'me'}</a>}
        <span>© {currentYear} {portfolio.name || 'Your Name'}</span>
      </footer>
    </main>
  )
}

export default ProfessionalPortfolio
