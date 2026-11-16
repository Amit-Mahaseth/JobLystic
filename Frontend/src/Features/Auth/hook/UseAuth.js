import { useContext } from "react";
import { AuthContext } from '../Auth.Context.js'
import { Register, Login, Logout } from '../services/auth.api.js'

/**
 * Extracts error message from API response or falls back to default.
 *
 * @param {any} err - Error object.
 * @param {string} fallback - Default message.
 * @returns {string} Error message string.
 */
const getErrorMessage = (err, fallback) =>
  err.response?.data?.msg ||
  err.response?.data?.errors?.[0]?.msg ||
  fallback

/**
 * Custom hook providing user authentication state, loading indicators, and sign-in/sign-out actions.
 *
 * @returns {{
 *   user: Object|null,
 *   loading: boolean,
 *   HandleLogin: function({ email: string, password: string }): Promise<{ success: boolean, message: string }>,
 *   HandleRegister: function({ Fullname: { firstname: string, lastname: string }, email: string, password: string }): Promise<{ success: boolean, message: string }>,
 *   HandleLogout: function(): Promise<{ success: boolean, message: string }>
 * }}
 */
export const UseAuth = () => {
  const context = useContext(AuthContext)
  const { user, setuser, loading, setloading } = context

  const HandleLogin = async ({ email, password }) => {
    setloading(true)
    try {
      const data = await Login({ email, password })
      setuser(data.user)
      return { success: true, message: "login successfully" }
    } catch (err) {
      console.error("login failed:", err);
      return {
        success: false,
        message: getErrorMessage(err, "login failed"),
      };
    } finally {
      setloading(false)
    }
  }

  const HandleRegister = async ({ Fullname: { firstname, lastname }, email, password }) => {
    setloading(true)
    try {
      const data = await Register({ Fullname: { firstname, lastname }, email, password })
      setuser(data.user)
      return {
        success: true,
        message: "register successfully"
      }
    } catch (err) {
      console.error("register failed:", err);
      return {
        success: false,
        message: getErrorMessage(err, "register failed"),
      };
    } finally {
      setloading(false)
    }
  }

  const HandleLogout = async () => {
    setloading(true)
    try {
      await Logout()
      setuser(null)
      return { success: true, message: "logout successfully" }
    } catch (err) {
      console.error("logout failed:", err);
      return {
        success: false,
        message: getErrorMessage(err, "logout failed"),
      };
    } finally {
      setloading(false)
    }
  }

  return { user, loading, HandleLogin, HandleRegister, HandleLogout }
}