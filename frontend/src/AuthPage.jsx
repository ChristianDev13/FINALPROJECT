import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
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

function AuthPage() {
  const isRegister = useLocation().pathname === '/register'
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const user = isRegister
        ? await authApi.register(form)
        : await authApi.login({ email: form.email, password: form.password })

      navigate('/', {
        replace: true,
        state: { authNotice: `Welcome${isRegister ? '' : ' back'}, ${user.name}!` },
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
      <section className="auth-card" aria-label={isRegister ? 'Create an account' : 'Sign in'}>
        <div className="auth-form-panel">
          <Link className="auth-mark" to="/" aria-label="Ptech home">
            <img src="/assets/small-logo.png" alt="" />
          </Link>
          <h1>{isRegister ? 'Register to your account' : 'Login to your account'}</h1>

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
            <div className="auth-field">
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
            </div>
            <PasswordField
              id="password"
              label="Password"
              value={form.password}
              onChange={updateField}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
            {isRegister && (
              <PasswordField
                id="password_confirmation"
                label="Confirm password"
                value={form.password_confirmation}
                onChange={updateField}
                autoComplete="new-password"
              />
            )}
            {isRegister && <p className="password-hint">Use at least 8 characters.</p>}
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className={`auth-submit${isRegister ? ' auth-submit--register' : ''}`} type="submit" disabled={submitting}>
              {submitting ? 'Please wait…' : isRegister ? 'Register' : 'Login'}
            </button>
          </form>

          <p className="auth-switch">
            {isRegister ? 'Already have an account?' : "Don’t have an account?"}{' '}
            <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Login' : 'Register'}</Link>
          </p>
        </div>
        <BrandPanel />
      </section>
      <p className="auth-copyright">© 2026 All rights reserved. No copyright infringement intended — for project use only.</p>
    </main>
  )
}

export default AuthPage
