import { useState } from 'react'
import { Eye, EyeOff, Menu, X } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { accountApi } from './api/account.js'
import { authApi } from './api/auth.js'

function PasswordField({ id, label, value, onChange, autoComplete }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="auth-field">
      <label className="sr-only" htmlFor={id}>{label}</label>
      <input
        id={id}
        name={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={label}
        autoComplete={autoComplete}
        maxLength={255}
        required
      />
      <button
        className="password-toggle"
        type="button"
        aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        aria-pressed={visible}
        onClick={() => setVisible(!visible)}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}

function BrandPanel() {
  return (
    <aside className="auth-brand-panel">
      <img className="auth-large-logo" src="/assets/big-logo.png" alt="Ptech Technologies" />
      <h2>Your <span>Portfolio</span> Your <span>Way</span></h2>
      <p>Discover portfolio designs made to highlight your skills, projects, and achievements.</p>
    </aside>
  )
}

function AuthPage({ mode }) {
  const location = useLocation()
  const isRegister = mode === 'register'
  const isForgot = mode === 'forgot'
  const isReset = mode === 'reset'
  const navigate = useNavigate()
  const query = new URLSearchParams(location.search)
  const [menuOpen, setMenuOpen] = useState(false)
  const [form, setForm] = useState(() => ({
    name: '',
    email: location.state?.email ?? query.get('email') ?? '',
    password: '',
    password_confirmation: '',
  }))
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const loginNotice = !isRegister && !isForgot && !isReset
    ? location.state?.registrationNotice ?? location.state?.resetNotice
    : ''
  const closeMenu = () => setMenuOpen(false)

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      if (isRegister) {
        const user = await authApi.register(form)
        setForm({
          name: '',
          email: user.email,
          password: '',
          password_confirmation: '',
        })
        navigate('/login', {
          replace: true,
          state: {
            from: location.state?.from,
            selectedTemplate: location.state?.selectedTemplate,
            template: location.state?.template,
            email: user.email,
            registrationNotice: `Account created for ${user.email}. Please log in.`,
          },
        })
        return
      }

      if (isForgot) {
        const message = await authApi.requestPasswordReset(form.email)
        setNotice(message)
        return
      }

      if (isReset) {
        const token = query.get('token')
        if (!token) {
          setError('This password reset link is invalid or expired. Request a new one and try again.')
          return
        }

        const message = await authApi.resetPassword({ ...form, token })
        navigate('/login', {
          replace: true,
          state: {
            email: form.email,
            resetNotice: message,
          },
        })
        return
      }

      const user = await authApi.login({ email: form.email, password: form.password })
      const selectedTemplate = location.state?.selectedTemplate
      if (selectedTemplate) {
        await accountApi.selectTemplate(selectedTemplate.toLowerCase())
      }

      const returnTo = location.state?.from ?? '/'

      navigate(returnTo, {
        replace: true,
        state: {
          template: location.state?.template,
          selectedTemplate,
          authNotice: `Welcome back, ${user.name}!`,
        },
      })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className={`auth-page${isRegister ? ' auth-page--register' : ' auth-page--login'}`}>
      <div className="auth-grid" aria-hidden="true" />
      <header className="site-header auth-site-header" data-sticky-nav>
        <Link className="brand" to="/" aria-label="Ptech home" onClick={closeMenu}>
          <img src="/assets/small-logo.png" alt="" />
          <span className="brand-name">Ptech</span>
          <span className="brand-divider" />
          <span className="brand-caption">Technologies</span>
        </Link>
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <nav className={`site-nav${menuOpen ? ' site-nav--open' : ''}`} aria-label="Main navigation">
          <Link to="/#home" onClick={closeMenu}>Home</Link>
          <Link to="/#templates" onClick={closeMenu}>Templates</Link>
          <Link
            className={`nav-button nav-button--dark${!isRegister && !isForgot && !isReset ? ' auth-nav-current' : ''}`}
            to="/login"
            aria-current={!isRegister && !isForgot && !isReset ? 'page' : undefined}
            onClick={closeMenu}
          >
            Login
          </Link>
          <Link
            className={`nav-button nav-button--dark${isRegister ? ' auth-nav-current' : ''}`}
            to="/register"
            aria-current={isRegister ? 'page' : undefined}
            onClick={closeMenu}
          >
            Register
          </Link>
          <Link className="nav-button nav-button--light" to="/#templates" onClick={closeMenu}>Get started</Link>
          <Link to="/#contact" onClick={closeMenu}>Contact</Link>
        </nav>
      </header>
      <section className="auth-card" aria-label={isRegister ? 'Create an account' : isForgot ? 'Request a password reset' : isReset ? 'Set a new password' : 'Sign in'}>
        <div className="auth-form-panel">
          <Link className="auth-mark" to="/" aria-label="Ptech home">
            <img src="/assets/small-logo.png" alt="" />
          </Link>
          <h1>{isRegister
            ? 'Register to your account'
            : isForgot
              ? 'Forgot your password?'
              : isReset
                ? 'Create a new password'
                : 'Login to your account'}</h1>
          {loginNotice && <p className="auth-success" role="status">{loginNotice}</p>}
          {notice && <p className="auth-success" role="status">{notice}</p>}

          <form className="auth-form" onSubmit={handleSubmit}>
            {isRegister && (
              <div className="auth-field">
                <label className="sr-only" htmlFor="name">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={updateField}
                  placeholder="Name"
                  autoComplete="name"
                  maxLength={255}
                  required
                />
              </div>
            )}
            {!isReset && <div className="auth-field">
              <label className="sr-only" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={updateField}
                placeholder="Email"
                autoComplete="email"
                maxLength={255}
                required
              />
            </div>}
            {!isForgot && (
              <PasswordField
                id="password"
                label={isReset ? 'New password' : 'Password'}
                value={form.password}
                onChange={updateField}
                autoComplete={isRegister || isReset ? 'new-password' : 'current-password'}
              />
            )}
            {(isRegister || isReset) && (
              <PasswordField
                id="password_confirmation"
                label="Confirm password"
                value={form.password_confirmation}
                onChange={updateField}
                autoComplete="new-password"
              />
            )}
            {(isRegister || isReset) && <p className="password-hint">Use at least 8 characters.</p>}
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className={`auth-submit${isRegister ? ' auth-submit--register' : ''}`} type="submit" disabled={submitting}>
              {submitting
                ? 'Please wait…'
                : isRegister
                  ? 'Register'
                  : isForgot
                    ? 'Send reset link'
                    : isReset
                      ? 'Reset password'
                      : 'Login'}
            </button>
          </form>

          <p className="auth-switch">
            {isRegister
              ? 'Already have an account?'
              : isForgot || isReset
                ? 'Remember your password?'
                : "Don’t have an account?"}{' '}
            <Link to={isRegister || isForgot || isReset ? '/login' : '/register'} state={location.state}>
              {isRegister || isForgot || isReset ? 'Login' : 'Register'}
            </Link>
          </p>
        </div>
        <BrandPanel />
      </section>
      <p className="auth-copyright">© 2026 All rights reserved. No copyright infringement intended — for project use only.</p>
    </main>
  )
}

export default AuthPage
