// Premium Input component with icon support + validation states
import { forwardRef, useState } from 'react'
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Input = forwardRef(function Input(
  {
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    error,
    success,
    hint,
    icon: Icon,
    className = '',
    required,
    disabled,
    ...props
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type

  const borderClass = error
    ? 'border-rose-500/50 focus:border-rose-500/70 focus:shadow-[0_0_0_3px_rgba(244,63,94,0.12)]'
    : success
    ? 'border-emerald-500/50 focus:border-emerald-500/70 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.12)]'
    : ''

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-300">
          {label}
          {required && <span className="ml-1 text-rose-400">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
            <Icon className="h-4 w-4" />
          </div>
        )}

        <input
          ref={ref}
          type={resolvedType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            input-field w-full rounded-xl py-3 text-sm
            ${Icon ? 'pl-10' : 'pl-4'}
            ${isPassword || error || success ? 'pr-10' : 'pr-4'}
            ${borderClass}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          {...props}
        />

        {/* Right side icons */}
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-slate-500 hover:text-slate-300 transition-colors p-0.5"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
          {error && !isPassword && <AlertCircle className="h-4 w-4 text-rose-400" />}
          {success && !isPassword && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
        </div>
      </div>

      {/* Error / Hint messages with animation */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5 text-xs text-rose-400"
          >
            <AlertCircle className="h-3 w-3 flex-shrink-0" />
            {error}
          </motion.p>
        )}
        {success && !error && (
          <motion.p
            key="success"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5 text-xs text-emerald-400"
          >
            <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
            {success}
          </motion.p>
        )}
        {hint && !error && !success && (
          <motion.p
            key="hint"
            className="text-xs text-slate-500"
          >
            {hint}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
})

export default Input
