import { Link, useNavigate } from 'react-router-dom'
import '../styles/login.scss'
import { useState } from 'react'
import {UseAuth}from '../hook/UseAuth.js'
function Login() {

  const {loading,HandleLogin} =UseAuth()
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
  if(loading){
    return (
      <main>
        <h1>Loading....</h1>
      </main>
    )
  }

  return (
    <main className="auth-page login-page">
      <section className="auth-card" aria-labelledby="login-title">
        <Link className="auth-brand" to="/" aria-label="GenAI home">
          <span className="auth-brand__mark" aria-hidden="true">
            G
          </span>
          GenAI
        </Link>

        <div className="auth-heading">
          <p className="auth-eyebrow">WELCOME BACK</p>
          <h1 id="login-title">Sign in to your account</h1>
          <p className="auth-description">
            Pick up where you left off. Your next great idea is waiting.
          </p>
        </div>

        <form className="auth-form" onSubmit={HandleSubmit}>
          {error && <p role="alert">{error}</p>}
          <label className="auth-field" htmlFor="login-email">
            Email address
            <input
              autoComplete="email"
              id="login-email"
              name="email"
              placeholder="you@example.com"
              type="email"
                onChange={(e)=>{
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
              onChange={(e)=>{setPassword(e.target.value)}}
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

          <button className="auth-submit" type="submit" >
            Sign in
          </button>
        </form>

        <p className="auth-switch">
          New to GenAI? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  )
}

export default Login
