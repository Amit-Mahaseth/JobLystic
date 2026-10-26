import { useContext } from "react";
import { AuthContext } from '../auth.context.jsx'
import { Register, Login, Logout } from '../services/auth.api.js'

const getErrorMessage = (err, fallback) =>
    err.response?.data?.msg ||
    err.response?.data?.errors?.[0]?.msg ||
    fallback

export const UseAuth = () => {
    const context = useContext(AuthContext)
    const { user, setuser, loading, setloading } = context

    const HandleLogin = async ({ email, password }) => {

        setloading(true)
        try {
            const data = await Login({ email, password })
            setuser(data.user)
            return { success: true, message: "login successfully" }
        }
        catch (err) {
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