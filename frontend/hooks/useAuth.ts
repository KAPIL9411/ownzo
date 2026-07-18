import { useEffect, useRef, useCallback } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { auth } from '@/frontend/lib/firebase/config'
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth'
import { AuthService } from '@/frontend/services/auth.service'
import { useRouter } from 'next/navigation'
import { fetchCSRFToken, clearCSRFToken } from '@/frontend/services/api.service'

export function useAuth() {
  const {
    user, token, isAuthenticated, isLoading,
    setUser, setToken, setLoading, setAuthenticating, logout,
  } = useAuthStore()
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
              try {
                await fetchCSRFToken()
              } catch (csrfError) {
                console.warn('Failed to fetch CSRF token after login:', csrfError)
              }

              // Auth cycle fully complete — dismiss the global overlay
              setAuthenticating(false)
            } else {
              setAuthenticating(false)
            }
          } catch (error) {
            console.error('Auth error:', error)
            if (isMountedRef.current) {
              setAuthenticating(false)
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

    // Handle redirect result (fallback from popup-blocked scenario).
    // getRedirectResult resolves with null if there's no pending redirect,
    // so this is safe to call on every page load.
    getRedirectResult(auth).catch((error) => {
      // Ignore 'no redirect operation' — it's the normal case
      if (error?.code !== 'auth/no-current-user') {
        console.error('Redirect sign-in error:', error)
      }
    })

    return () => {
      isMountedRef.current = false
      authRequestRef.current = null
      unsubscribe()
    }
  }, []) // Empty dependency array - store methods are stable

  // Popup → Redirect fallback pattern.
  // Returns 'success' | 'cancelled' | 'redirecting' so the caller
  // can distinguish between the three outcomes without try/catch.
  const signInWithGoogle = useCallback(async (): Promise<'success' | 'cancelled' | 'redirecting'> => {
    const provider = new GoogleAuthProvider()
    provider.addScope('profile')
    provider.addScope('email')
    provider.setCustomParameters({ prompt: 'select_account' })

    try {
      await signInWithPopup(auth, provider)
      // Popup succeeded. Activate the GLOBAL overlay immediately so there
      // is zero visible gap while onAuthStateChanged fires async.
      setAuthenticating(true)
      return 'success'
    } catch (error: any) {
      if (error?.code === 'auth/popup-closed-by-user') {
        return 'cancelled'
      }
      if (error?.code === 'auth/popup-blocked') {
        console.info('Popup blocked — falling back to redirect sign-in.')
        // setAuthenticating here too so redirect flow also shows overlay
        setAuthenticating(true)
        await signInWithRedirect(auth, provider)
        return 'redirecting'
      }
      console.error('Google sign-in error:', error)
      throw error
    }
  }, [setAuthenticating])

  const handleLogout = useCallback(async () => {
    try {
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
