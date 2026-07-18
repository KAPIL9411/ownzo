import { useEffect, useRef, useCallback } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { auth } from '@/frontend/lib/firebase/config'
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth'
import { AuthService } from '@/frontend/services/auth.service'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const { user, token, isAuthenticated, isLoading, setUser, setToken, setLoading, logout } = useAuthStore()
  const router = useRouter()
  
  // Track in-flight requests to prevent state updates after unmount
  const isMountedRef = useRef(true)
  const authRequestRef = useRef<Promise<void> | null>(null)

  useEffect(() => {
    isMountedRef.current = true
    let isInitialLoad = true

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
            }
          } catch (error) {
            console.error('Auth error:', error)
            if (isMountedRef.current) {
              logout()
            }
          }
        } else {
          if (isMountedRef.current) {
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
