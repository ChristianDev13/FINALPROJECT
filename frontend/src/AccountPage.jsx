import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  CircleUserRound,
  Clock3,
  Eye,
  FileText,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Palette,
  Settings,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { accountApi } from './api/account.js'
import { authApi } from './api/auth.js'
import {
  CREATIVE_PORTFOLIO_KEY,
} from './creativePortfolioData.js'
import { PROFESSIONAL_PORTFOLIO_KEY } from './professionalPortfolioData.js'
import './AccountPage.css'

const templates = [
  { slug: 'minimal', name: 'Minimal', detail: 'Quiet, clean, and focused on your work.' },
  { slug: 'creative', name: 'Creative', detail: 'Colorful, expressive, and made to stand out.' },
  { slug: 'professional', name: 'Professional', detail: 'Polished and structured for your career.' },
]

const portfolioStorageKeys = {
  minimal: 'ptech_minimal_portfolio',
  creative: CREATIVE_PORTFOLIO_KEY,
  professional: PROFESSIONAL_PORTFOLIO_KEY,
}

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'account', label: 'My Account', icon: CircleUserRound },
  { id: 'templates', label: 'Choose Template', icon: Palette },
  { id: 'history', label: 'Template History', icon: Clock3 },
  { id: 'portfolios', label: 'My Portfolio', icon: BriefcaseBusiness },
  { id: 'settings', label: 'Settings', icon: Settings },
]

function templatePath(slug, action = 'create') {
  if (action === 'portfolio') return `/portfolio/${slug}`
  return slug === 'minimal' ? '/create' : `/create/${slug}`
}

function AccountPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [history, setHistory] = useState([])
  const [portfolios, setPortfolios] = useState([])
  const [preferences, setPreferences] = useState({ show_email: false, profile_public: true })
  const [section, setSection] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [preview, setPreview] = useState(null)
  const [accountForm, setAccountForm] = useState({ name: '', email: '' })
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  })

  useEffect(() => {
    let active = true

    async function loadAccount() {
      try {
        const [currentUser, templateHistory, savedPortfolios] = await Promise.all([
          authApi.getCurrentUser(),
          accountApi.getTemplateHistory(),
          accountApi.getPortfolios(),
        ])

        if (!currentUser) {
          navigate('/login', { replace: true, state: { from: '/account' } })
          return
        }

        if (active) {
          setUser(currentUser)
          setAccountForm({ name: currentUser.name, email: currentUser.email })
          setPreferences({
            profile_public: currentUser.preferences?.profile_public ?? true,
            show_email: currentUser.preferences?.show_email ?? false,
          })
          setHistory(templateHistory)
          setPortfolios(savedPortfolios)
        }
      } catch (requestError) {
        if (requestError.status === 401) {
          navigate('/login', { replace: true, state: { from: '/account' } })
          return
        }
        if (active) setError(requestError.message)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadAccount()
    return () => {
      active = false
    }
  }, [navigate])

  const currentTemplate = useMemo(
    () => history.find((selection) => selection.is_current),
    [history],
  )

  async function saveAccount(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    setSaving(true)
    try {
      const updatedUser = await accountApi.updateAccount(accountForm)
      setUser(updatedUser)
      setAccountForm({ name: updatedUser.name, email: updatedUser.email })
      setNotice('Your account details have been updated.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function selectTemplate(slug, continueToBuilder = false) {
    setError('')
    setNotice('')
    setSaving(true)
    try {
      const updatedHistory = await accountApi.selectTemplate(slug)
      setHistory(updatedHistory)
      if (slug && continueToBuilder) {
        const savedPortfolio = portfolios.find((portfolio) => portfolio.template_slug === slug)
        if (savedPortfolio) {
          openPortfolio(savedPortfolio, 'create')
        } else {
          navigate(templatePath(slug), {
            state: { template: templates.find((template) => template.slug === slug)?.name },
          })
        }
      } else {
        setNotice(slug
          ? `${templates.find((template) => template.slug === slug)?.name} is now your current template.`
          : 'Your current template selection has been cleared.')
      }
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function removeHistory(selection) {
    if (!window.confirm(`Remove ${selection.template_name} from your template history?`)) return

    setError('')
    try {
      await accountApi.deleteTemplateHistory(selection.id)
      setHistory((current) => current.filter((item) => item.id !== selection.id))
      setNotice('The template was removed from your history.')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function savePreferences(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    setSaving(true)
    try {
      const updatedPreferences = await accountApi.updatePreferences(preferences)
      setPreferences(updatedPreferences)
      setNotice('Your preferences have been saved.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function updatePassword(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    setSaving(true)
    try {
      await accountApi.updatePassword(passwordForm)
      setPasswordForm({ current_password: '', password: '', password_confirmation: '' })
      setNotice('Your password has been updated.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function removePortfolio(portfolio) {
    if (!window.confirm(`Delete your ${portfolio.template_name} portfolio?`)) return

    setError('')
    try {
      await accountApi.deletePortfolio(portfolio.id)
      setPortfolios((current) => current.filter((item) => item.id !== portfolio.id))
      setNotice('The saved portfolio was deleted.')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function logout() {
    setError('')
    try {
      await authApi.logout()
      navigate('/', { replace: true, state: { authNotice: 'You have been logged out.' } })
    } catch (requestError) {
      navigate('/', {
        replace: true,
        state: { authNotice: `Your local session ended, but the server could not confirm logout: ${requestError.message}` },
      })
    }
  }

  function openPortfolio(portfolio, action) {
    try {
      sessionStorage.setItem(portfolioStorageKeys[portfolio.template_slug], JSON.stringify(portfolio.data))
      navigate(templatePath(portfolio.template_slug, action))
    } catch {
      setError('This portfolio could not be opened in this browser. Check available storage and try again.')
    }
  }

  function renderContent() {
    if (section === 'dashboard') {
      return (
        <>
          <div className="account-page-heading">
            <p className="account-eyebrow">YOUR CREATIVE SPACE</p>
            <h1>Welcome back, {user.name.split(' ')[0]}.</h1>
            <p>Keep your profile and portfolio moving forward.</p>
          </div>
          <div className="account-stat-grid">
            <article className="account-stat-card">
              <span className="account-stat-icon"><Palette size={18} /></span>
              <p>Current template</p>
              <strong>{currentTemplate?.template_name ?? 'Not selected'}</strong>
              <button type="button" onClick={() => setSection('templates')}>Browse styles <ArrowUpRight size={14} /></button>
            </article>
            <article className="account-stat-card">
              <span className="account-stat-icon"><Clock3 size={18} /></span>
              <p>Template selections</p>
              <strong>{history.length}</strong>
              <button type="button" onClick={() => setSection('history')}>View history <ArrowUpRight size={14} /></button>
            </article>
            <article className="account-stat-card">
              <span className="account-stat-icon"><BriefcaseBusiness size={18} /></span>
              <p>Saved portfolios</p>
              <strong>{portfolios.length}</strong>
              <button type="button" onClick={() => setSection('portfolios')}>Manage portfolios <ArrowUpRight size={14} /></button>
            </article>
          </div>
          <section className="account-panel account-dashboard-latest">
            <div className="account-panel-heading">
              <div><p className="account-eyebrow">RECENT ACTIVITY</p><h2>Template history</h2></div>
              <button type="button" className="account-text-link" onClick={() => setSection('history')}>See all <ArrowUpRight size={14} /></button>
            </div>
            {history.length ? <HistoryList history={history.slice(0, 3)} onPreview={setPreview} onSelect={selectTemplate} onDelete={removeHistory} /> : <EmptyState message="Your template selections will show up here." />}
          </section>
        </>
      )
    }

    if (section === 'account') {
      return (
        <>
          <PageHeading eyebrow="PROFILE DETAILS" title="My Account" description="Manage the personal information connected to your login." />
          <section className="account-panel account-form-panel">
            <div className="account-panel-heading"><div><p className="account-eyebrow">PERSONAL INFORMATION</p><h2>Account details</h2></div><UserRound size={20} /></div>
            <form className="account-form" onSubmit={saveAccount}>
              <label><span>Full name</span><input required maxLength="255" value={accountForm.name} onChange={(event) => setAccountForm({ ...accountForm, name: event.target.value })} /></label>
              <label><span>Email address</span><input required type="email" maxLength="255" value={accountForm.email} onChange={(event) => setAccountForm({ ...accountForm, email: event.target.value })} /></label>
              <div className="account-form-actions"><p>Changes are saved to your account.</p><button className="account-primary-button" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button></div>
            </form>
          </section>
          <section className="account-panel account-identity-card">
            <div className="account-avatar">{user.name.charAt(0).toUpperCase()}</div>
            <div><strong>{user.name}</strong><span>{user.email}</span></div>
            <span className="account-verified"><ShieldCheck size={14} /> Account connected</span>
          </section>
        </>
      )
    }

    if (section === 'templates') {
      return (
        <>
          <PageHeading eyebrow="FIND YOUR STYLE" title="Choose a template" description="Choose a layout to start or switch the style on your portfolio." />
          <div className="account-template-grid">
            {templates.map((template) => {
              const isCurrent = currentTemplate?.template_slug === template.slug
              return (
                <article className={`account-template-card account-template-card--${template.slug}`} key={template.slug}>
                  <button className="account-template-preview" type="button" onClick={() => setPreview(template)} aria-label={`Preview ${template.name} template`}>
                    <TemplateMockup slug={template.slug} />
                    <span><Eye size={14} /> Preview</span>
                  </button>
                  <div className="account-template-details">
                    <div><h2>{template.name}</h2>{isCurrent && <span className="account-current-badge"><Check size={12} /> Current</span>}</div>
                    <p>{template.detail}</p>
                    <button
                      className="account-primary-button"
                      type="button"
                      disabled={saving}
                      onClick={() => selectTemplate(template.slug, !isCurrent)}
                    >
                      {isCurrent ? 'Continue editing' : 'Select template'}
                    </button>
                    {isCurrent && (
                      <button
                        className="account-template-clear-button"
                        type="button"
                        disabled={saving}
                        onClick={() => selectTemplate(null)}
                      >
                        Unselect template
                      </button>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </>
      )
    }

    if (section === 'history') {
      return (
        <>
          <PageHeading eyebrow="YOUR STYLE JOURNEY" title="Template History" description="Every template you select is saved here. Preview it, switch back, or remove it." />
          <section className="account-panel">
            {history.length ? <HistoryList history={history} onPreview={setPreview} onSelect={selectTemplate} onDelete={removeHistory} /> : <EmptyState message="No template selections yet. Pick a style to start your history." action={() => setSection('templates')} actionLabel="Choose a template" />}
          </section>
        </>
      )
    }

    if (section === 'portfolios') {
      return (
        <>
          <PageHeading eyebrow="YOUR WORK, SAVED" title="My Portfolio" description="Preview, edit, and manage the portfolio designs saved to your account." />
          <section className="account-panel">
            {portfolios.length ? (
              <div className="account-portfolios-list">
                {portfolios.map((portfolio) => (
                  <article className="account-saved-portfolio" key={portfolio.id}>
                    <span className={`account-portfolio-mark account-portfolio-mark--${portfolio.template_slug}`}><FileText size={19} /></span>
                    <div className="account-saved-portfolio-info">
                      <h2>{portfolio.data.name || portfolio.template_name} portfolio</h2>
                      <p>{portfolio.template_name} template · Updated {formatDate(portfolio.updated_at)}</p>
                    </div>
                    <div className="account-row-actions">
                      <button type="button" onClick={() => openPortfolio(portfolio, 'portfolio')}>Preview <Eye size={14} /></button>
                      <button type="button" onClick={() => openPortfolio(portfolio, 'create')}>Edit <ArrowUpRight size={14} /></button>
                      <button className="account-icon-button account-delete-button" type="button" aria-label={`Delete ${portfolio.template_name} portfolio`} onClick={() => removePortfolio(portfolio)}><Trash2 size={16} /></button>
                    </div>
                  </article>
                ))}
              </div>
            ) : <EmptyState message="Your saved designs will appear here after you create a portfolio while signed in." action={() => setSection('templates')} actionLabel="Choose a template" />}
          </section>
        </>
      )
    }

    return (
      <>
        <PageHeading eyebrow="ACCOUNT PREFERENCES" title="Settings" description="Protect your account and choose how your portfolio information is shared." />
        <section className="account-panel account-settings-panel">
          <div className="account-panel-heading"><div><p className="account-eyebrow">PRIVACY</p><h2>Profile preferences</h2></div><ShieldCheck size={20} /></div>
          <form onSubmit={savePreferences}>
            <label className="account-toggle-row">
              <span><strong>Public portfolio</strong><small>Allow people with your portfolio link to view your work.</small></span>
              <input type="checkbox" checked={preferences.profile_public} onChange={(event) => setPreferences({ ...preferences, profile_public: event.target.checked })} />
            </label>
            <label className="account-toggle-row">
              <span><strong>Show contact email</strong><small>Display your email address on your portfolio.</small></span>
              <input type="checkbox" checked={preferences.show_email} onChange={(event) => setPreferences({ ...preferences, show_email: event.target.checked })} />
            </label>
            <button className="account-primary-button" disabled={saving}>{saving ? 'Saving…' : 'Save preferences'}</button>
          </form>
        </section>
        <section className="account-panel account-settings-panel">
          <div className="account-panel-heading"><div><p className="account-eyebrow">SECURITY</p><h2>Change password</h2></div><LockKeyhole size={20} /></div>
          <form className="account-form" onSubmit={updatePassword}>
            <label><span>Current password</span><input required type="password" autoComplete="current-password" maxLength="255" value={passwordForm.current_password} onChange={(event) => setPasswordForm({ ...passwordForm, current_password: event.target.value })} /></label>
            <label><span>New password</span><input required type="password" autoComplete="new-password" minLength="8" maxLength="255" value={passwordForm.password} onChange={(event) => setPasswordForm({ ...passwordForm, password: event.target.value })} /></label>
            <label><span>Confirm new password</span><input required type="password" autoComplete="new-password" minLength="8" maxLength="255" value={passwordForm.password_confirmation} onChange={(event) => setPasswordForm({ ...passwordForm, password_confirmation: event.target.value })} /></label>
            <div className="account-form-actions"><p>Use at least 8 characters.</p><button className="account-primary-button" disabled={saving}>{saving ? 'Saving…' : 'Update password'}</button></div>
          </form>
        </section>
      </>
    )
  }

  return (
    <div className="account-page">
      <header className="site-header account-site-header" data-sticky-nav>
        <Link className="brand" to="/" aria-label="Ptech home">
          <img src="/assets/small-logo.png" alt="" /><span className="brand-name">Ptech</span><span className="brand-divider" /><span className="brand-caption">Technologies</span>
        </Link>
        <nav className="site-nav" aria-label="Main navigation">
          <Link to="/">Home</Link>
          <Link to="/#templates">Templates</Link>
          <span className="account-nav-user">{user?.name ?? 'My account'}</span>
          <button className="nav-button nav-button--dark" type="button" onClick={logout}>Log out</button>
        </nav>
      </header>
      <main className="account-shell">
        <aside className="account-sidebar">
          <p className="account-sidebar-label">WORKSPACE</p>
          <nav aria-label="Account navigation">
            {navigation.map(({ id, label, icon: Icon }) => (
              <button className={section === id ? 'account-sidebar-link account-sidebar-link--active' : 'account-sidebar-link'} type="button" key={id} aria-current={section === id ? 'page' : undefined} onClick={() => { setSection(id); setError(''); setNotice('') }}>
                <Icon size={17} strokeWidth={1.8} />{label}{id === 'history' && history.length > 0 && <span>{history.length}</span>}
              </button>
            ))}
            <button className="account-sidebar-link account-sidebar-logout" type="button" onClick={logout}><LogOut size={17} strokeWidth={1.8} />Log Out</button>
          </nav>
          <div className="account-sidebar-help"><span>Make good things.</span><strong>Share them well.</strong><Link to="/#templates">Explore templates <ArrowDownRight size={14} /></Link></div>
        </aside>
        <div className="account-main">
          {loading ? <div className="account-loading" role="status">Loading your account…</div> : error && !user ? <div className="account-load-error" role="alert"><p>{error}</p><button type="button" onClick={() => navigate('/')}>Return home</button></div> : (
            <>
              {error && <p className="account-feedback account-feedback--error" role="alert">{error}</p>}
              {notice && <p className="account-feedback account-feedback--success" role="status">{notice}</p>}
              {user && renderContent()}
            </>
          )}
        </div>
      </main>
      {preview && (
        <div className="account-preview-backdrop" role="presentation" onClick={() => setPreview(null)}>
          <section className="account-preview-dialog" role="dialog" aria-modal="true" aria-labelledby="account-preview-title" onClick={(event) => event.stopPropagation()}>
            <button className="account-preview-close" type="button" aria-label="Close preview" onClick={() => setPreview(null)}><X size={19} /></button>
            <p className="account-eyebrow">TEMPLATE PREVIEW</p>
            <h2 id="account-preview-title">{preview.name ?? preview.template_name}</h2>
            <TemplateMockup slug={preview.slug ?? preview.template_slug} large />
            <p>{templates.find((template) => template.slug === (preview.slug ?? preview.template_slug))?.detail}</p>
            <button
              className="account-primary-button"
              type="button"
              disabled={saving}
              onClick={() => selectTemplate(preview.slug ?? preview.template_slug, true)}
            >
              Select and continue
            </button>
          </section>
        </div>
      )}
    </div>
  )
}

function PageHeading({ eyebrow, title, description }) {
  return <div className="account-page-heading"><p className="account-eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>
}

function HistoryList({ history, onPreview, onSelect, onDelete }) {
  return (
    <div className="account-history-list">
      {history.map((selection) => {
        const template = templates.find((item) => item.slug === selection.template_slug)
        return (
          <article className="account-history-row" key={selection.id}>
            <button className={`account-history-art account-history-art--${selection.template_slug}`} type="button" onClick={() => onPreview({ ...template, template_slug: selection.template_slug, template_name: selection.template_name })} aria-label={`Preview ${selection.template_name} template`}>
              <TemplateMockup slug={selection.template_slug} />
            </button>
            <div className="account-history-info">
              <div><h2>{selection.template_name}</h2><span className={selection.is_current ? 'account-current-badge' : 'account-previous-badge'}>{selection.is_current ? <><Check size={12} /> Current</> : 'Previous'}</span></div>
              <p>Selected {formatDate(selection.selected_at)}</p>
            </div>
            <div className="account-row-actions">
              <button type="button" onClick={() => onPreview({ ...template, template_slug: selection.template_slug, template_name: selection.template_name })}>Preview <Eye size={14} /></button>
              <button type="button" disabled={selection.is_current} onClick={() => onSelect(selection.template_slug)}>Select again <ArrowUpRight size={14} /></button>
              <button className="account-icon-button account-delete-button" type="button" aria-label={`Delete ${selection.template_name} history record`} onClick={() => onDelete(selection)}><Trash2 size={16} /></button>
            </div>
          </article>
        )
      })}
    </div>
  )
}

function TemplateMockup({ slug, large = false }) {
  return (
    <div className={`account-mockup account-mockup--${slug}${large ? ' account-mockup--large' : ''}`} aria-hidden="true">
      <div className="account-mockup-top"><i /><span /><span /></div>
      <div className="account-mockup-content">
        <div className="account-mockup-intro"><i /><b /><span /><span /><span /></div>
        <div className="account-mockup-photo" />
        <div className="account-mockup-lines"><b /><span /><span /><span /></div>
      </div>
    </div>
  )
}

function EmptyState({ message, action, actionLabel }) {
  return <div className="account-empty-state"><span><FileText size={20} /></span><p>{message}</p>{action && <button type="button" onClick={action}>{actionLabel} <ArrowUpRight size={14} /></button>}</div>
}

function formatDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'a recent date' : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default AccountPage
