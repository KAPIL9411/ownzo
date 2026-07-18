import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/auth.store'

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

// Store CSRF token
let csrfToken: string | null = null

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CSRF cookies
})

// Request interceptor to add auth token and CSRF token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add CSRF token for state-changing requests
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method?.toUpperCase() || '')) {
      if (csrfToken) {
        config.headers['x-csrf-token'] = csrfToken
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
    
    // If CSRF token is invalid, fetch new one and retry
    if (error.response?.status === 403 && 
        error.response?.data?.error?.includes('CSRF')) {
      try {
        await fetchCSRFToken()
        // Retry the original request
        if (error.config) {
          return apiClient.request(error.config)
        }
      } catch (csrfError) {
        // If fetching CSRF token fails, proceed with original error
      }
    }
    
    return Promise.reject(error)
  }
)

// Fetch CSRF token from server
export async function fetchCSRFToken(): Promise<void> {
  try {
    const response = await apiClient.get('/auth/csrf-token')
    if (response.data.success && response.data.data.csrfToken) {
      csrfToken = response.data.data.csrfToken
    }
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error)
  }
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

    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  }
}

export default apiClient
