/**
 * Reusable status/chip badge. Variants: success, warning, error, info, neutral.
 */
export default function Badge({ children, variant = 'neutral', className = '' }) {
  const variants = {
    success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    neutral: 'bg-gray-200 text-gray-700 border-gray-300',
  }
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${variants[variant] || variants.neutral} ${className}`}
    >
      {children}
    </span>
  )
}
