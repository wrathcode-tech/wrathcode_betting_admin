import { useEffect } from 'react'
import { HiX } from 'react-icons/hi'

export default function Modal({ open, onClose, title, children, size = 'md', scrollable = false }) {
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

  const sizeClass = size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-2xl' : size === 'xl' ? 'max-w-3xl' : 'max-w-lg'
  const maxHeightClass = scrollable ? 'max-h-[90vh] flex flex-col' : ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        className={`relative w-full ${sizeClass} ${maxHeightClass} bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-white shrink-0">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button type="button" onClick={onClose} className="p-2 rounded-xl text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors" aria-label="Close">
              <HiX className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className={`text-gray-800 ${scrollable ? 'overflow-y-auto flex-1 min-h-0 p-6' : 'p-6'}`}>{children}</div>
      </div>
    </div>
  )
}
