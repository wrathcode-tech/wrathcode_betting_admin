import { useEffect } from 'react'
import { HiExclamation } from 'react-icons/hi'

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = false, onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return
    const handle = (e) => e.key === 'Escape' && onCancel()
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} aria-hidden />
      <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-xl p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${danger ? 'bg-red-500/20 text-red-500' : 'bg-teal-100 text-teal-600'}`}>
            <HiExclamation className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-gray-500 text-sm mt-1">{message}</p>
            <div className="flex gap-3 mt-5">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium text-sm transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={() => { onConfirm(); onCancel(); }}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${danger ? 'bg-red-600 text-white hover:bg-red-500' : 'bg-teal-500 text-white hover:bg-teal-600'}`}
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
