// Glassmorphic Card component with optional hover and glow effects
import { motion } from 'framer-motion'

export default function Card({
  children,
  className = '',
  hover = true,
  glow = false,
  gradient = false,
  as = 'div',
  ...props
}) {
  const baseClass = `
    card
    ${hover ? 'hover:border-brand-500/20 hover:shadow-card-hover' : ''}
    ${glow ? 'glow-border' : ''}
    ${gradient ? 'bg-gradient-to-br from-[#0F1525] to-[#0B0F1A]' : ''}
    ${className}
  `

  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={baseClass}
        {...props}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div className={baseClass} {...props}>
      {children}
    </div>
  )
}

// Glassmorphic overlay card
export function GlassCard({ children, className = '', ...props }) {
  return (
    <div
      className={`glass rounded-2xl ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

// Stat Card
export function StatCard({ label, value, change, icon: Icon, color = 'brand', className = '' }) {
  const colorMap = {
    brand: { bg: 'bg-brand-500/10', text: 'text-brand-400', border: 'border-brand-500/20' },
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  }
  const c = colorMap[color] || colorMap.brand

  return (
    <div className={`stat-card ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="mt-1.5 text-2xl font-bold font-display text-white">{value}</p>
          {change && (
            <p className={`mt-1 text-xs font-medium ${change > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {change > 0 ? '↑' : '↓'} {Math.abs(change)}% from last session
            </p>
          )}
        </div>
        {Icon && (
          <div className={`rounded-xl p-3 ${c.bg} border ${c.border}`}>
            <Icon className={`h-5 w-5 ${c.text}`} />
          </div>
        )}
      </div>
    </div>
  )
}
