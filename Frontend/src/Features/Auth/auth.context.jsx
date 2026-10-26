import { createContext, useEffect, useState } from 'react'
import { GetMe } from './services/auth.api.js'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setuser] = useState(null)
    const [loading, setloading] = useState(true)

    useEffect(() => {
        const restoreSession = async () => {
            try {
                const data = await GetMe()
                setuser(data.user)
            } catch (err) {
                if (err.response?.status !== 401) {
                    console.error('Could not restore auth session:', err)
                }
                setuser(null)
            } finally {
                setloading(false)
            }
        }

        restoreSession()
    }, [])

    return (
        <AuthContext.Provider value={{ user, setuser, loading, setloading }}>
            {children}
        </AuthContext.Provider>
    )
}