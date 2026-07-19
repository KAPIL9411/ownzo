import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/auth.store'

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

// Store CSRF token
let csrfToken: string | null = null
// 🔒 SECURITY FIX: Track CSRF fetch promise to prevent race condition
let csrfFetchPromise: Promise<void> | null = null

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CSRF cookies
})

// Request interceptor to add auth token and CSRF token
apiClient.interceptors.request.use(
  async (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add CSRF token for state-changing requests
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method?.toUpperCase() || '')) {
      // 🔒 SECURITY FIX: Wait for CSRF token if it's being fetched
      if (csrfFetchPromise) {
        try {
          await csrfFetchPromise
        } catch (e) {
          // Continue even if CSRF fetch fails
        }
      }
      
      if (csrfToken) {
        config.headers['x-csrf-token'] = csrfToken
      } else if (useAuthStore.getState().isAuthenticated) {
        // 🔒 SECURITY FIX: If authenticated but no token, fetch it now
        try {
          await fetchCSRFToken()
          if (csrfToken) {
            config.headers['x-csrf-token'] = csrfToken
          }
        } catch (e) {
          console.warn('Failed to fetch CSRF token before request')
        }
      }
    }
    
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    if (error.response?.status === 401) {
      // Unauthorized - logout user
      useAuthStore.getState().logout()
      
      // Only redirect in browser
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    
    // 🔒 SECURITY FIX: If CSRF token is invalid, fetch new one and retry ONCE
    if (error.response?.status === 403 && 
        error.response?.data?.error?.includes('CSRF') &&
        error.config && 
        !(error.config as any).__isRetry) { // Prevent infinite retry loop
      try {
        await fetchCSRFToken()
        
        // Mark this request as a retry to prevent infinite loop
        const retryConfig = { ...error.config, __isRetry: true } as any
        
        // Add the fresh CSRF token
        if (csrfToken) {
          retryConfig.headers = retryConfig.headers || {}
          retryConfig.headers['x-csrf-token'] = csrfToken
        }
        
        return apiClient.request(retryConfig)
      } catch (csrfError) {
        console.error('Failed to fetch CSRF token on retry:', csrfError)
        // Proceed with original error
      }
    }
    
    return Promise.reject(error)
  }
)

// Fetch CSRF token from server
export async function fetchCSRFToken(): Promise<void> {
  // 🔒 SECURITY FIX: If already fetching, wait for existing promise
  if (csrfFetchPromise) {
    return csrfFetchPromise
  }
  
  csrfFetchPromise = (async () => {
    try {
      const response = await apiClient.get('/auth/csrf-token')
      if (response.data.success && response.data.data.csrfToken) {
        csrfToken = response.data.data.csrfToken
      }
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error)
      throw error
    } finally {
      // Clear the promise after completion
      csrfFetchPromise = null
    }
  })()
  
  return csrfFetchPromise
}

// Initialize CSRF token on first authenticated request
export async function initializeCSRF(): Promise<void> {
  if (!csrfToken && useAuthStore.getState().isAuthenticated) {
    await fetchCSRFToken()
  }
}

// Clear CSRF token (e.g., on logout)
export function clearCSRFToken(): void {
  csrfToken = null
  csrfFetchPromise = null
}

export class ApiService {
  static async get<T>(url: string, config?: AxiosRequestConfig) {
    const response = await apiClient.get<T>(url, config)
    return response.data
  }

  static async post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await apiClient.post<T>(url, data, config)
    return response.data
  }

  static async patch<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await apiClient.patch<T>(url, data, config)
    return response.data
  }

  static async delete<T>(url: string, config?: AxiosRequestConfig) {
    const response = await apiClient.delete<T>(url, config)
    return response.data
  }

  static async uploadFile(file: File, type: 'image' | 'video' = 'image') {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    // Longer timeout for uploads (2 minutes)
    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 2 minutes timeout
      // Add retry configuration
      validateStatus: (status) => {
        // Accept 2xx status codes
        return status >= 200 && status < 300
      },
    })

    return response.data
  }
}

export default apiClient
