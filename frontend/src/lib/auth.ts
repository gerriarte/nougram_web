/**
 * Authentication utilities and token management
 */
import { logger } from './logger'

export interface AuthToken {
  access_token: string
  token_type?: string
  expires_in?: number
}

export interface UserSession {
  token: string
  user?: {
    id: number
    email: string
    full_name: string
    role: string
    organization_id?: number
  }
  expiresAt?: number
}

const TOKEN_KEY = 'auth_token'
const SESSION_KEY = 'auth_session'
const TOKEN_EXPIRY_KEY = 'auth_token_expiry'

/**
 * Get auth token from localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Set auth token in localStorage
 */
export function setAuthToken(token: string, expiresIn?: number): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(TOKEN_KEY, token)
  
  if (expiresIn) {
    const expiresAt = Date.now() + (expiresIn * 1000)
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt.toString())
  }
}

/**
 * Remove auth token from localStorage
 */
export function removeAuthToken(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem(TOKEN_EXPIRY_KEY)
}

/**
 * Check if token is expired
 */
export function isTokenExpired(): boolean {
  if (typeof window === 'undefined') return true
  
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY)
  if (!expiry) return false // No expiry set, assume valid
  
  return Date.now() >= parseInt(expiry)
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getAuthToken()
  if (!token) return false
  
  // Check if token is expired
  if (isTokenExpired()) {
    logger.warn('Token expired, removing from storage')
    removeAuthToken()
    return false
  }
  
  return true
}

/**
 * Decode JWT token (basic decoding, no verification)
 */
export function decodeToken(token: string): any {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    logger.error('Error decoding token:', error)
    return null
  }
}

/**
 * Get token expiration time
 */
export function getTokenExpiration(token: string): number | null {
  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) return null
  return decoded.exp * 1000 // Convert to milliseconds
}

/**
 * Check if token will expire soon (within 5 minutes)
 */
export function isTokenExpiringSoon(): boolean {
  const token = getAuthToken()
  if (!token) return true
  
  const expiry = getTokenExpiration(token)
  if (!expiry) return false
  
  const fiveMinutes = 5 * 60 * 1000
  return expiry - Date.now() < fiveMinutes
}

/**
 * Save user session data
 */
export function saveSession(session: UserSession): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

/**
 * Get user session data
 */
export function getSession(): UserSession | null {
  if (typeof window === 'undefined') return null
  
  const sessionStr = localStorage.getItem(SESSION_KEY)
  if (!sessionStr) return null
  
  try {
    return JSON.parse(sessionStr)
  } catch (error) {
    logger.error('Error parsing session:', error)
    return null
  }
}

/**
 * Clear all auth data
 */
export function clearAuth(): void {
  removeAuthToken()
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY)
  }
}

/**
 * Logout user
 */
export function logout(): void {
  clearAuth()
  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
}


