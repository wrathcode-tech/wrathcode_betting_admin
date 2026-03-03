import { createContext, useContext, useState, useCallback } from 'react'
import { HiCheckCircle, HiXCircle } from 'react-icons/hi'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(({ id, message, type }) => (
          <div
            key={id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-sm ${
              type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : type === 'error'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-white border-gray-200 text-gray-800'
            }`}
          >
            {type === 'success' && <HiCheckCircle className="w-5 h-5 flex-shrink-0" />}
            {type === 'error' && <HiXCircle className="w-5 h-5 flex-shrink-0" />}
            <span className="text-sm font-medium">{message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
