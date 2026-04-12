// Reusable Button component with multiple variants
import { motion } from 'framer-motion'
import { forwardRef } from 'react'

const variantMap = {
  primary: 'btn-primary rounded-xl px-5 py-2.5 text-sm',
  secondary: 'btn-secondary rounded-xl px-5 py-2.5 text-sm',
  ghost: 'btn-ghost rounded-xl px-5 py-2.5 text-sm',
  danger: 'bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 rounded-xl px-5 py-2.5 text-sm',
  outline: 'border border-white/10 bg-transparent text-slate-300 hover:border-white/20 hover:text-white rounded-xl px-5 py-2.5 text-sm',
}

const sizeMap = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-sm',
  xl: 'px-7 py-3 text-base',
}

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    loading = false,
    icon: Icon,
    iconRight: IconRight,
    disabled,
    ...props
  },
  ref
) {
  const base = variantMap[variant] || variantMap.primary
  const sizeClass = size !== 'md' ? sizeMap[size] : ''

  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.97 }}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50
        ${base} ${sizeClass} ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {typeof children === 'string' ? 'Loading...' : children}
        </>
      ) : (
        <>
          {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
          {children}
          {IconRight && <IconRight className="h-4 w-4 flex-shrink-0" />}
        </>
      )}
    </motion.button>
  )
})

export default Button
