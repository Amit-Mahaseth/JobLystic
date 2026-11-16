import { Link, useNavigate } from 'react-router-dom'
import '../styles/login.scss'
import { useState } from 'react'
import { UseAuth } from '../hook/UseAuth.js'
import { useTheme } from '../../../contexts/themeContext.js'
import ToggleTheme from '../../../components/ToggleTheme/ToggleTheme.jsx'
import '../../../styles/visual-system.scss'

/**
 * Login page component allowing users to sign in with email and password.
 *
 * @returns {import('react').JSX.Element}
 */
function Login() {
  const { loading, HandleLogin } = UseAuth()
  const { theme } = useTheme()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const HandleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const result = await HandleLogin({ email, password })
    if (result.success) {
      navigate("/", { replace: true })
    } else {
      setError(result.message)
    }
  }

  if (loading) {
    return (
      <main className="auth-page login-page" data-theme={theme}>
        <p className="auth-loading" role="status">Signing you in...</p>
      </main>
    )
  }

  return (
    <main className="auth-page login-page" data-theme={theme}>
      <header className="auth-topbar">
        <Link className="auth-brand" to="/" aria-label="Joblystics home">
          <span className="auth-brand__mark" aria-hidden="true">
            J
          </span>
          Joblystics
        </Link>
        <ToggleTheme />
      </header>

      <div className="auth-layout">
        <aside className="auth-showcase" aria-label="Joblystics career workspace">
          <p className="auth-showcase__eyebrow">CAREER WORKSPACE</p>
          <h2>Welcome back.</h2>
          <p className="auth-showcase__description">
            Pick up where you left off and keep moving toward your next opportunity.
          </p>
          <div className="auth-showcase__features">
            <span><i aria-hidden="true" /> Your career insights, all in one place</span>
            <span><i aria-hidden="true" /> Practical interview preparation</span>
            <span><i aria-hidden="true" /> A clear path to your next step</span>
          </div>
        </aside>

        <section className="auth-card" aria-labelledby="login-title">
          <div className="auth-heading">
            <p className="auth-eyebrow">WELCOME BACK</p>
            <h1 id="login-title">Sign in to your account</h1>
            <p className="auth-description">
              Sign in to review your reports and career progress.
            </p>
          </div>

          <form className="auth-form" onSubmit={HandleSubmit}>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <label className="auth-field" htmlFor="login-email">
              Email address
              <input
                autoComplete="email"
                id="login-email"
                name="email"
                placeholder="you@example.com"
                type="email"
                onChange={(e) => {
                  setEmail(e.target.value)
                }}
              />
            </label>

            <label className="auth-field" htmlFor="login-password">
              Password
              <input
                autoComplete="current-password"
                id="login-password"
                name="password"
                placeholder="Enter your password"
                type="password"
                onChange={(e) => { setPassword(e.target.value) }}
              />
            </label>

            <div className="auth-form__options">
              <label className="auth-checkbox">
                <input name="remember" type="checkbox" />
                <span>Remember me</span>
              </label>
              <button className="auth-text-button" type="button">
                Forgot password?
              </button>
            </div>

            <button className="auth-submit" type="submit">
              Sign in
            </button>
          </form>

          <p className="auth-switch">
            New to Joblystics? <Link to="/register">Create an account</Link>
          </p>
        </section>
      </div>
    </main>
  )
}

export default Login
