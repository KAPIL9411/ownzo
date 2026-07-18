"use client"

import * as React from "react"
import { cn } from "@/frontend/lib/utils"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"

type ToastType = "success" | "error" | "warning" | "info"

interface ToastData {
  id: string
  type: ToastType
  title: string
  description?: string
}

interface ToastContextValue {
  toasts: ToastData[]
  toast: (data: Omit<ToastData, "id">) => void
  dismiss: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue>({
  toasts: [],
  toast: () => {},
  dismiss: () => {},
})

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastData[]>([])

  const toast = React.useCallback((data: Omit<ToastData, "id">) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { ...data, id }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  return React.useContext(ToastContext)
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
  error: <AlertCircle className="h-5 w-5 text-red-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
}

const styles: Record<ToastType, string> = {
  success: "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800",
  error: "border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800",
  warning: "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800",
  info: "border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800",
}

function ToastContainer({ toasts, dismiss }: { toasts: ToastData[]; dismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex items-start gap-3 rounded-xl border p-4 shadow-lg pointer-events-auto animate-in slide-in-from-bottom-5 fade-in duration-300",
            styles[t.type]
          )}
        >
          {icons[t.type]}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{t.title}</p>
            {t.description && (
              <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
            )}
          </div>
          <button onClick={() => dismiss(t.id)} className="opacity-60 hover:opacity-100 transition-opacity shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
