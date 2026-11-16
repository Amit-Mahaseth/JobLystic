import { Link, useNavigate } from 'react-router-dom'
import '../styles/register.scss'
import { UseAuth } from "../hook/UseAuth";
import { useState } from 'react';
import { useTheme } from '../../../contexts/themeContext.js'
import ToggleTheme from '../../../components/ToggleTheme/ToggleTheme.jsx'
import '../../../styles/visual-system.scss'

/**
 * Registration page component allowing new users to create an account.
 *
 * @returns {import('react').JSX.Element}
 */
function Register() {
  const { loading, HandleRegister } = UseAuth()
  const { theme } = useTheme()
  const [Email, setEmail] = useState("")
  const [Firstname, setFirstname] = useState('')
  const [Lastname, setLastname] = useState('')
  const [Password, setPassword] = useState('')
  const [error, setError] = useState('')

  const navigate = useNavigate();

  const HandleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await HandleRegister({
        Fullname: {
          firstname: Firstname,
          lastname: Lastname,
        },
        email: Email,
        password: Password,
      });

      if (result?.success) {
        navigate("/");
      } else {
        setError(result?.message || 'Registration failed')
      }
    } catch (error) {
      console.error("Submit error:", error);
      setError('Registration failed. Please try again.')
    }
  };

  if (loading) {
    return (
      <main className="auth-page register-page" data-theme={theme}>
        <p className="auth-loading" role="status">Creating your account...</p>
      </main>
    )
  }

  return (
    <main className="auth-page register-page" data-theme={theme}>
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
          <p className="auth-showcase__eyebrow">START YOUR NEXT CHAPTER</p>
          <h2>Make your next move count.</h2>
          <p className="auth-showcase__description">
            Create a workspace for your interview reports, preparation, and career growth.
          </p>
          <div className="auth-showcase__features">
            <span><i aria-hidden="true" /> Keep your interview reports together</span>
            <span><i aria-hidden="true" /> Find the skills to focus on next</span>
            <span><i aria-hidden="true" /> Build confidence at your own pace</span>
          </div>
        </aside>

        <section className="auth-card" aria-labelledby="register-title">
          <div className="auth-heading">
            <p className="auth-eyebrow">GET STARTED</p>
            <h1 id="register-title">Create your account</h1>
            <p className="auth-description">
              Set up your account and start planning what comes next.
            </p>
          </div>

          <form className="auth-form" onSubmit={HandleSubmit}>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <label className="auth-field" htmlFor="register-firstname">
              Full name
              <div className="register-input">
                <input
                  autoComplete="given-name"
                  id="register-firstname"
                  name="firstname"
                  placeholder="First name"
                  type="text"
                  onChange={(e) => setFirstname(e.target.value)}
                />
                <input
                  autoComplete="family-name"
                  id="register-lastname"
                  aria-label="Last name"
                  name="lastname"
                  placeholder="Last name"
                  type="text"
                  onChange={(e) => setLastname(e.target.value)}
                />
              </div>
            </label>

            <label className="auth-field" htmlFor="register-email">
              Email address
              <input
                autoComplete="email"
                id="register-email"
                name="email"
                placeholder="you@example.com"
                type="email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label className="auth-field" htmlFor="register-password">
              Password
              <input
                autoComplete="new-password"
                id="register-password"
                name="password"
                placeholder="Create a password"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            <button className="auth-submit" type="submit">
              Create Account
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
          <p className="auth-terms">
            By creating an account, you agree to our <a href="#terms">Terms</a> and{' '}
            <a href="#privacy">Privacy Policy</a>.
          </p>
        </section>
      </div>
    </main>
  )
}

export default Register
