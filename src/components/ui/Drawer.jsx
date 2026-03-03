/**
 * Slide-over drawer (right side). Enterprise admin panel - user profile, details.
 */
import { useEffect } from 'react'
import { HiX } from 'react-icons/hi'

export default function Drawer({ open, onClose, title, children, width = 'max-w-md' }) {
  useEffect(() => {
    if (!open) return
    const handle = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', handle)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handle)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={`relative ml-auto w-full ${width} h-full bg-white border-l border-gray-200 shadow-xl flex flex-col animate-fade-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors"
            aria-label="Close"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  )
}
