import { createContext, useContext } from 'react'

export const ThemeContext = createContext(null)

/**
 * Hook to access current theme state (`dark` or `light`) and theme toggle dispatcher.
 *
 * @returns {{ theme: string, toggleTheme: function(): void }} Theme context value.
 * @throws {Error} If called outside a ThemeProvider.
 */
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
