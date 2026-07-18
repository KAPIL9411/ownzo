import { useEffect, useRef, useCallback } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { auth } from '@/frontend/lib/firebase/config'
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth'
import { AuthService } from '@/frontend/services/auth.service'
import { useRouter } from 'next/navigation'
import { fetchCSRFToken, clearCSRFToken } from '@/frontend/services/api.service'

export function useAuth() {
  const { user, token, isAuthenticated, isLoading, setUser, setToken, setLoading, logout } = useAuthStore()
  const router = useRouter()
  
  // Track in-flight requests to prevent state updates after unmount
  const isMountedRef = useRef(true)
  const authRequestRef = useRef<Promise<void> | null>(null)

  // 🧪 E2E TESTING BYPASS
  // If we are running E2E tests, bypass Firebase Auth listener
  // We use window object so Playwright can inject this dynamically without restarting the dev server
  const isE2E = typeof window !== 'undefined' && (window as any).PLAYWRIGHT_TESTING === true;

  useEffect(() => {
    isMountedRef.current = true
    let isInitialLoad = true

    if (isE2E) {
      if (isInitialLoad && isMountedRef.current) {
        // Force authentication state synchronously so layout doesn't redirect
        useAuthStore.getState().setUser({ id: 'mock', name: 'Mock User', email: 'mock@example.com' } as any)
        setLoading(false)
        isInitialLoad = false
      }
      return () => {
        isMountedRef.current = false
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Cancel any previous in-flight auth request
      if (authRequestRef.current) {
        authRequestRef.current = null
      }

      const authRequest = (async () => {
        if (firebaseUser) {
          try {
            const idToken = await firebaseUser.getIdToken()
            
            // Check if still mounted before making API call
            if (!isMountedRef.current) return

            const response = await AuthService.login(idToken)
            
            // Check again before updating state
            if (!isMountedRef.current) return
            
            if (response.success && response.data) {
              setUser(response.data.user)
              setToken(response.data.token)
              
              // 🔒 SECURITY FIX: Fetch CSRF token immediately after login
              // This prevents race condition on first API call
              try {
                await fetchCSRFToken()
              } catch (csrfError) {
                console.warn('Failed to fetch CSRF token after login:', csrfError)
                // Non-critical error, continue anyway
              }
            }
          } catch (error) {
            console.error('Auth error:', error)
            if (isMountedRef.current) {
              logout()
            }
          }
        } else {
          if (isMountedRef.current) {
            // 🔒 SECURITY FIX: Clear CSRF token on logout
            clearCSRFToken()
            logout()
          }
        }

        // Only set loading to false after initial auth check
        if (isInitialLoad && isMountedRef.current) {
          setLoading(false)
          isInitialLoad = false
        }
      })()

      authRequestRef.current = authRequest
    })

    return () => {
      isMountedRef.current = false
      authRequestRef.current = null
      unsubscribe()
    }
  }, []) // Empty dependency array - store methods are stable

  // Memoize callbacks to prevent re-renders
  const signInWithGoogle = useCallback(async () => {
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      router.push('/')
    } catch (error) {
      console.error('Google sign-in error:', error)
      throw error
    }
  }, [router])

  const handleLogout = useCallback(async () => {
    try {
      // 🔒 SECURITY FIX: Clear CSRF token before logout
      clearCSRFToken()
      await AuthService.logout()
      await signOut(auth)
      logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }, [logout, router])

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    signInWithGoogle,
    logout: handleLogout,
  }
}
