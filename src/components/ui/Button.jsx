/**
 * Reusable button. Variants: primary, secondary, danger, ghost.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-colors focus:ring-2 focus:ring-teal-500/50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-teal-500 text-white hover:bg-teal-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-500',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
  }
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2.5 text-sm', lg: 'px-5 py-3 text-base' }
  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
      {children}
    </button>
  )
}
