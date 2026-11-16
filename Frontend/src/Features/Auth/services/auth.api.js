import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true
})

/**
 * Registers a new account via the Auth microservice.
 *
 * @param {Object} credentials - Registration parameters.
 * @param {Object} credentials.Fullname - Name object with firstname and lastname.
 * @param {string} credentials.email - User email address.
 * @param {string} credentials.password - Account password.
 * @returns {Promise<Object>} API response data with user and status message.
 * @throws {Error} When registration request fails.
 */
export async function Register({ Fullname, email, password }) {
  const response = await api.post("/api/auth/register", {
    Fullname,
    email,
    password
  })
  return response.data
}

/**
 * Logs in a user using email and password.
 *
 * @param {Object} credentials - Login parameters.
 * @param {string} credentials.email - User email address.
 * @param {string} credentials.password - Account password.
 * @returns {Promise<Object>} API response data with user object.
 * @throws {Error} When login request fails.
 */
export async function Login({ email, password }) {
  const response = await api.post("/api/auth/login", {
    email,
    password
  })
  return response.data
}

/**
 * Logs out the current user session by clearing auth cookies.
 *
 * @returns {Promise<Object>} API response confirmation.
 * @throws {Error} When logout request fails.
 */
export async function Logout() {
  const response = await api.post('/api/auth/logout')
  return response.data
}

/**
 * Fetches the currently authenticated user's profile using session cookie.
 *
 * @returns {Promise<Object>} API response data containing user profile.
 * @throws {Error} When unauthorized or request fails.
 */
export async function GetMe() {
  const response = await api.get('/api/auth/getme')
  return response.data
}

