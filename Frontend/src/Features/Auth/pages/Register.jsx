import { Link, useNavigate } from 'react-router-dom'
import '../styles/register.scss'
import { UseAuth } from "../hook/UseAuth";
import { useState } from 'react';
function Register() {
  const { loading, HandleRegister } = UseAuth()
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
      <main>
        <h1>
          Loading...
        </h1>
      </main>
    )
  }
  return (
    <main className="auth-page register-page">
      <section className="auth-card" aria-labelledby="register-title">
        <Link className="auth-brand" to="/" aria-label="GenAI home">
          <span className="auth-brand__mark" aria-hidden="true">
            G
          </span>
          GenAI
        </Link>

        <div className="auth-heading">
          <p className="auth-eyebrow">GET STARTED</p>
          <h1 id="register-title">Create your account</h1>
          <p className="auth-description">
            Join GenAI and bring your ideas to life.
          </p>
        </div>

        <form className="auth-form" onSubmit={HandleSubmit}>
          {error && <p role="alert">{error}</p>}
          <label className="auth-field" htmlFor="register-name">
            Full name
            <div className='register-input'>
              <input
                autoComplete="name"
                id="register-firstname"
                name="name"
                placeholder="FirstName"
                type="text"
                onChange={(e) => setFirstname(e.target.value)}
              />
              <input
                autoComplete="name"
                id="register-lastname"
                name="name"
                placeholder="LastName"
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
              onChange={(e) => setEmail(e.target.value)} />
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


          <button
            className="auth-submit"
            type="submit"
          >
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
    </main>
  )
}

export default Register