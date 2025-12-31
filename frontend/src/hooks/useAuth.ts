/**
 * Custom hook for authentication management
 */
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { 
  getAuthToken, 
  setAuthToken, 
  removeAuthToken, 
  isAuthenticated,
  isTokenExpired,
  logout as clearAuth,
  type UserSession
} from '@/lib/auth'
import { apiRequest } from '@/lib/api-client'
import { queryKeys, type CurrentUser } from '@/lib/queries'
import { logger } from '@/lib/logger'

export interface UseAuthReturn {
  isAuthenticated: boolean
  isLoading: boolean
  user: CurrentUser | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  refreshUser: () => Promise<void>
  checkAuth: () => boolean
}

export function useAuth(): UseAuthReturn {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<CurrentUser | null>(null)

  /**
   * Check authentication status
   */
  const checkAuth = useCallback((): boolean => {
    return isAuthenticated()
  }, [])

  /**
   * Fetch current user data
   */
  const fetchUser = useCallback(async (): Promise<CurrentUser | null> => {
    try {
      const response = await apiRequest<CurrentUser>('/auth/me')
      if (response.error) {
        logger.error('Failed to fetch user:', response.error)
        return null
      }
      return response.data || null
    } catch (error) {
      logger.error('Error fetching user:', error)
      return null
    }
  }, [])

  /**
   * Refresh user data
   */
  const refreshUser = useCallback(async (): Promise<void> => {
    const userData = await fetchUser()
    setUser(userData)
    queryClient.setQueryData(queryKeys.currentUser, userData)
  }, [fetchUser, queryClient])

  /**
   * Login function
   */
  const login = useCallback(async (
    email: string, 
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true)
      
      const response = await apiRequest<{ access_token: string; token_type?: string; expires_in?: number }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      if (response.error) {
        return { success: false, error: response.error }
      }

      if (!response.data?.access_token) {
        return { success: false, error: 'No se recibió token de acceso' }
      }

      // Save token
      setAuthToken(response.data.access_token, response.data.expires_in)

      // Fetch user data
      const userData = await fetchUser()
      if (!userData) {
        removeAuthToken()
        return { success: false, error: 'No se pudo obtener información del usuario' }
      }

      setUser(userData)
      queryClient.setQueryData(queryKeys.currentUser, userData)
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUser })

      return { success: true }
    } catch (error) {
      logger.error('Login error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al iniciar sesión' 
      }
    } finally {
      setIsLoading(false)
    }
  }, [fetchUser, queryClient])

  /**
   * Logout function
   */
  const handleLogout = useCallback(() => {
    clearAuth()
    setUser(null)
    queryClient.clear()
    router.push('/login')
  }, [queryClient, router])

  /**
   * Initialize auth state
   */
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true)
      
      if (!isAuthenticated()) {
        setIsLoading(false)
        return
      }

      // Check if token is expired
      if (isTokenExpired()) {
        logger.warn('Token expired on init')
        clearAuth()
        setIsLoading(false)
        return
      }

      // Fetch user data
      const userData = await fetchUser()
      if (!userData) {
        // Token might be invalid, clear it
        clearAuth()
        setIsLoading(false)
        return
      }

      setUser(userData)
      setIsLoading(false)
    }

    initAuth()
  }, [fetchUser])

  /**
   * Set up token expiration check
   */
  useEffect(() => {
    if (!isAuthenticated()) return

    const checkTokenExpiry = setInterval(() => {
      if (isTokenExpired()) {
        logger.warn('Token expired, logging out')
        handleLogout()
      }
    }, 60000) // Check every minute

    return () => clearInterval(checkTokenExpiry)
  }, [handleLogout])

  return {
    isAuthenticated: isAuthenticated() && !!user,
    isLoading,
    user,
    login,
    logout: handleLogout,
    refreshUser,
    checkAuth,
  }
}


