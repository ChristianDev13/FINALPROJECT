import { useState } from 'react'
import { ArrowDownRight, ArrowLeft, ArrowUpRight, Mail, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CREATIVE_PORTFOLIO_KEY, safeImageSource, safeWebUrl } from './creativePortfolioData.js'

const currentYear = new Date().getFullYear()

function loadPortfolio() {
  const saved = sessionStorage.getItem(CREATIVE_PORTFOLIO_KEY)
  if (!saved) return { portfolio: null, error: '' }

  try {
    const portfolio = JSON.parse(saved)
    if (
      !portfolio
      || typeof portfolio !== 'object'
      || Array.isArray(portfolio)
      || !Array.isArray(portfolio.projects)
      || (portfolio.socials !== undefined && (
        !portfolio.socials
        || typeof portfolio.socials !== 'object'
        || Array.isArray(portfolio.socials)
      ))
    ) {
      throw new Error('Saved portfolio data is not valid.')
    }
    return { portfolio, error: '' }
  } catch {
    return { portfolio: null, error: 'Your saved creative portfolio could not be opened. Return to the editor and create it again.' }
  }
}

function CreativePortfolio() {
  const [saved] = useState(loadPortfolio)
  const { portfolio, error } = saved

  if (!portfolio) {
    return (
      <main className="creative-empty-state">
        <Sparkles size={26} />
        <h1>{error ? 'Portfolio unavailable' : 'Your canvas is waiting.'}</h1>
        <p>{error || 'Add your details in the creative studio to see your portfolio here.'}</p>
        <Link to="/create/creative">Open creative studio <ArrowUpRight size={16} /></Link>
      </main>
    )
  }

  const skills = portfolio.skills.split(/\n|,/).map((skill) => skill.trim()).filter(Boolean)
  const projects = portfolio.projects.filter((project) => project.title || project.description || project.image)
  const socials = ['instagram', 'facebook', 'linkedin']
    .map((network) => [network, portfolio.socials[network] ?? ''])
    .map(([network, url]) => ({ network, url: safeWebUrl(url) }))
    .filter((social) => social.url)
  const previewTitle = portfolio.name || 'Your name'

  return (
    <main className="creative-portfolio-page">
      <header className="creative-portfolio-nav" data-sticky-nav>
        <a className="creative-portfolio-wordmark" href="#top">{previewTitle}<span>®</span></a>
        <nav aria-label="Portfolio sections">
          <a href="#about">About</a>
          <a href="#projects">Work</a>
          <a href="#contact">Contact</a>
        </nav>
        <Link className="creative-edit-link" to="/create/creative"><ArrowLeft size={15} /> Edit portfolio</Link>
      </header>

      <section id="top" className="creative-output-hero" data-scroll-reveal>
        <div className="creative-hero-orb creative-hero-orb--one" />
        <div className="creative-hero-orb creative-hero-orb--two" />
        <div className="creative-hero-content">
          <p className="creative-output-kicker"><Sparkles size={15} /> CREATIVE PORTFOLIO · 2026</p>
          <h1>{previewTitle}<span className="creative-title-period">.</span></h1>
          <p className="creative-output-role">{portfolio.role || 'Independent creative'}</p>
          <p className="creative-output-intro">{portfolio.introduction || 'A collection of ideas, experiments, and work made with intention.'}</p>
          <a className="creative-work-link" href="#projects">Explore my work <ArrowDownRight size={18} /></a>
        </div>
        <div className="creative-hero-sticker" aria-hidden="true"><span>MADE WITH<br />IMAGINATION</span><Sparkles size={25} /></div>
      </section>

      <section id="about" className="creative-about-section" data-scroll-reveal>
        <div className="creative-output-section-label"><span>01</span> A LITTLE ABOUT ME</div>
        <div className="creative-about-content">
          <h2>Curious by nature.<br /><span>Creative by choice.</span></h2>
          <div>
            <p>{portfolio.about || 'I like turning big ideas into meaningful visual stories. This is where my process, perspective, and personality come together.'}</p>
            {skills.length > 0 && (
              <div className="creative-skill-list" aria-label="Creative skills">
                {skills.map((skill, index) => <span key={`${skill}-${index}`}>{skill}</span>)}
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="projects" className="creative-project-section" data-scroll-reveal>
        <div className="creative-output-section-label"><span>02</span> SELECTED PROJECTS</div>
        <div className="creative-output-heading">
          <h2>Things I’ve<br /><span>put into the world.</span></h2>
          <span>A few favorites, just for you ↘</span>
        </div>
        {projects.length ? (
          <div className="creative-project-grid">
            {projects.map((project, index) => {
              const image = safeImageSource(project.image)
              return (
                <article className={`creative-project-card creative-project-card--${index % 3}`} key={`${project.title}-${index}`} data-scroll-reveal>
                  {image ? (
                    <img src={image} alt={project.title || 'Featured project'} loading="lazy" />
                  ) : (
                    <div className="creative-project-placeholder"><Sparkles size={34} /><span>FEATURED<br />PROJECT</span></div>
                  )}
                  <div className="creative-project-caption">
                    <h3>{project.title || 'Untitled project'}</h3>
                    {project.description && <p>{project.description}</p>}
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="creative-no-projects">Your next favorite project will look right at home here.</div>
        )}
      </section>

      <footer id="contact" className="creative-contact-section" data-scroll-reveal>
        <div className="creative-output-section-label"><span>03</span> YOUR TURN</div>
        <h2>Got a good<br />feeling? <span>Let’s make.</span></h2>
        <p>Have an idea, a question, or just want to say hi?</p>
        <div className="creative-contact-actions">
          {portfolio.email && <a className="creative-email-button" href={`mailto:${portfolio.email}`}><Mail size={17} /> Say hello <ArrowUpRight size={16} /></a>}
          <div className="creative-social-links">
            {socials.map(({ network, url }) => (
              <a href={url} target="_blank" rel="noreferrer" key={network} aria-label={network}>
                <span>{network === 'facebook' ? 'f' : network === 'linkedin' ? 'in' : 'ig'}</span>
              </a>
            ))}
          </div>
        </div>
        <div className="creative-contact-bottom"><span>© {currentYear} {previewTitle}</span><Link to="/create/creative">Back to creative studio <ArrowUpRight size={14} /></Link></div>
      </footer>
    </main>
  )
}

export default CreativePortfolio
