import { useState } from 'react'
import { ArrowLeft, ArrowUpRight, ImagePlus, Palette, Plus, Sparkles, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { CREATIVE_PORTFOLIO_KEY, initialCreativePortfolio } from './creativePortfolioData.js'
import './CreativePortfolio.css'

function loadDraft() {
  const saved = sessionStorage.getItem(CREATIVE_PORTFOLIO_KEY)
  if (!saved) return { portfolio: initialCreativePortfolio, error: '' }

  try {
    const parsed = JSON.parse(saved)
    if (
      !parsed
      || typeof parsed !== 'object'
      || Array.isArray(parsed)
      || !Array.isArray(parsed.projects)
      || (parsed.socials !== undefined && (!parsed.socials || typeof parsed.socials !== 'object'))
    ) {
      throw new Error('Saved portfolio data is not valid.')
    }
    const savedProjects = parsed.projects.filter((project) => (
      project
      && typeof project === 'object'
      && (project.title || project.description || project.image)
    ))

    return {
      portfolio: {
        ...initialCreativePortfolio,
        ...parsed,
        projects: savedProjects.length ? savedProjects : initialCreativePortfolio.projects,
        socials: Object.fromEntries(
          Object.keys(initialCreativePortfolio.socials).map((network) => [
            network,
            typeof parsed.socials?.[network] === 'string' ? parsed.socials[network] : '',
          ]),
        ),
      },
      error: '',
    }
  } catch {
    return {
      portfolio: initialCreativePortfolio,
      error: 'The previous draft could not be loaded. You can enter your details again.',
    }
  }
}

function CreativePortfolioBuilder() {
  const navigate = useNavigate()
  const [draft] = useState(loadDraft)
  const [portfolio, setPortfolio] = useState(draft.portfolio)
  const [saveError, setSaveError] = useState(draft.error)
  const [projectImageErrors, setProjectImageErrors] = useState({})

  function updateField(event) {
    const { name, value } = event.target
    setPortfolio((current) => ({ ...current, [name]: value }))
  }

  function updateProject(index, key, value) {
    setPortfolio((current) => ({
      ...current,
      projects: current.projects.map((project, projectIndex) => (
        projectIndex === index ? { ...project, [key]: value } : project
      )),
    }))
  }

  function addProject() {
    setPortfolio((current) => ({
      ...current,
      projects: [...current.projects, { title: '', description: '', image: '' }],
    }))
  }

  function removeProject(index) {
    setPortfolio((current) => ({
      ...current,
      projects: current.projects.filter((_, projectIndex) => projectIndex !== index),
    }))
    setProjectImageErrors((current) => {
      const nextErrors = {}
      Object.entries(current).forEach(([projectIndex, error]) => {
        const numericIndex = Number(projectIndex)
        if (numericIndex < index) nextErrors[numericIndex] = error
        if (numericIndex > index) nextErrors[numericIndex - 1] = error
      })
      return nextErrors
    })
  }

  function handleProjectImageChange(index, event) {
    const file = event.target.files?.[0]
    if (!file) return

    const extension = file.name.split('.').pop()?.toLowerCase()
    const isAllowedType = file.type === 'image/jpeg' || file.type === 'image/png'
    const isAllowedExtension = ['jpg', 'jpeg', 'png'].includes(extension)

    if (!isAllowedType || !isAllowedExtension) {
      setProjectImageErrors((current) => ({
        ...current,
        [index]: 'Choose a JPG or PNG image file.',
      }))
      event.target.value = ''
      return
    }

    const input = event.currentTarget
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setProjectImageErrors((current) => ({
          ...current,
          [index]: 'This image could not be loaded. Please choose another file.',
        }))
        input.value = ''
        return
      }

      updateProject(index, 'image', reader.result)
      setProjectImageErrors((current) => ({ ...current, [index]: '' }))
    }
    reader.onerror = () => {
      setProjectImageErrors((current) => ({
        ...current,
        [index]: 'This image could not be read. Please choose another file.',
      }))
      input.value = ''
    }
    reader.readAsDataURL(file)
  }

  function updateSocial(event) {
    const { name, value } = event.target
    setPortfolio((current) => ({
      ...current,
      socials: { ...current.socials, [name]: value },
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setSaveError('')

    try {
      sessionStorage.setItem(CREATIVE_PORTFOLIO_KEY, JSON.stringify(portfolio))
      navigate('/portfolio/creative')
    } catch {
      setSaveError('Your portfolio could not be saved in this browser. Check available storage and try again.')
    }
  }

  return (
    <main className="creative-builder-page">
      <header className="creative-builder-header" data-sticky-nav>
        <Link className="creative-back-link" to="/#templates"><ArrowLeft size={17} /> Templates</Link>
        <span><Palette size={15} /> Creative portfolio studio</span>
        <Link className="creative-view-link" to="/portfolio/creative">View portfolio <ArrowUpRight size={15} /></Link>
      </header>

      <div className="creative-builder-intro" data-scroll-reveal>
        <p><Sparkles size={15} /> MAKE A LITTLE NOISE</p>
        <h1>Your ideas deserve<br />a <span>colorful</span> home.</h1>
        <span>Fill in the details, then publish a separate portfolio page to see it all together.</span>
      </div>

      <form className="creative-builder-form" onSubmit={handleSubmit}>
        <section className="creative-input-section" data-scroll-reveal>
          <div className="creative-input-title"><span>01</span><div><h2>Your introduction</h2><p>Set the scene and say hello.</p></div></div>
          <div className="creative-form-grid">
            <label className="creative-field">
              <span>Your name</span>
              <input name="name" value={portfolio.name} onChange={updateField} placeholder="e.g. Jamie Rivera" />
            </label>
            <label className="creative-field">
              <span>Creative title</span>
              <input name="role" value={portfolio.role} onChange={updateField} placeholder="e.g. Illustrator & art director" />
            </label>
            <label className="creative-field creative-field--full">
              <span>Introduction</span>
              <textarea name="introduction" value={portfolio.introduction} onChange={updateField} rows="3" placeholder="A quick, lively introduction to your work..." />
            </label>
          </div>
        </section>

        <section className="creative-input-section" data-scroll-reveal>
          <div className="creative-input-title"><span>02</span><div><h2>About me</h2><p>Tell visitors what makes your perspective yours.</p></div></div>
          <label className="creative-field">
            <span>Your story</span>
            <textarea name="about" value={portfolio.about} onChange={updateField} rows="5" placeholder="What do you make? What inspires you? What do you want people to know?" />
          </label>
        </section>

        <section className="creative-input-section" data-scroll-reveal>
          <div className="creative-input-title"><span>03</span><div><h2>Creative skills</h2><p>Separate skills with commas or new lines.</p></div></div>
          <label className="creative-field">
            <span>Your creative toolkit</span>
            <textarea name="skills" value={portfolio.skills} onChange={updateField} rows="3" placeholder={'Illustration, Art direction\nBrand identity, Motion design'} />
          </label>
        </section>

        <section className="creative-input-section" data-scroll-reveal>
          <div className="creative-input-title"><span>04</span><div><h2>Featured projects</h2><p>Add as many projects as you need. Upload a JPG or PNG image for each one.</p></div></div>
          <div className="creative-project-inputs">
            {portfolio.projects.map((project, index) => (
              <div className="creative-project-input" key={index}>
                {portfolio.projects.length > 1 && (
                  <button
                    className="creative-remove-project"
                    type="button"
                    aria-label={`Remove project ${index + 1}`}
                    onClick={() => removeProject(index)}
                  >
                    <Trash2 size={15} /> Remove
                  </button>
                )}
                <label className="creative-field">
                  <span>Project title</span>
                  <input value={project.title} onChange={(event) => updateProject(index, 'title', event.target.value)} placeholder="e.g. Colorful campaign identity" />
                </label>
                <div className="creative-field creative-field--full">
                  <span>Project image <small>JPG or PNG only</small></span>
                  <label className="creative-image-upload">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                      onChange={(event) => handleProjectImageChange(index, event)}
                    />
                    <ImagePlus size={17} />
                    <span>{project.image ? 'Choose a different image' : 'Upload project image'}</span>
                  </label>
                  {project.image && <img className="creative-project-upload-preview" src={project.image} alt={`Preview for project ${index + 1}`} />}
                  {projectImageErrors[index] && <p className="creative-image-error" role="alert">{projectImageErrors[index]}</p>}
                </div>
                <label className="creative-field creative-field--full">
                  <span>Short description</span>
                  <textarea value={project.description} onChange={(event) => updateProject(index, 'description', event.target.value)} rows="2" placeholder="What was the idea behind this project?" />
                </label>
              </div>
            ))}
          </div>
          <button className="creative-add-project" type="button" onClick={addProject}>
            <Plus size={17} /> Add another project
          </button>
        </section>

        <section className="creative-input-section" data-scroll-reveal>
          <div className="creative-input-title"><span>05</span><div><h2>Find me online</h2><p>Share your creative corners of the internet.</p></div></div>
          <div className="creative-form-grid creative-social-form-grid">
            {Object.entries(portfolio.socials).map(([network, url]) => (
              <label className="creative-field" key={network}>
                <span>{network.charAt(0).toUpperCase() + network.slice(1)} profile URL</span>
                <input type="url" name={network} value={url} onChange={updateSocial} placeholder={`https://${network}.com/yourname`} />
              </label>
            ))}
            <label className="creative-field creative-field--full">
              <span>Contact email</span>
              <input type="email" name="email" value={portfolio.email} onChange={updateField} placeholder="hello@example.com" />
            </label>
          </div>
        </section>

        {saveError && <p className="creative-save-error" role="alert">{saveError}</p>}
        <div className="creative-submit-row">
          <p>Your preview opens as its own portfolio page. You can come back and edit any time.</p>
          <button type="submit">Create my portfolio <ArrowUpRight size={17} /></button>
        </div>
      </form>
    </main>
  )
}

export default CreativePortfolioBuilder
