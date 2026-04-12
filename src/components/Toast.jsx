// Premium Toast notification system
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useApp } from '../context/AppContext'

const typeConfig = {
  success: {
    icon: CheckCircle2,
    iconClass: 'text-emerald-400',
    barClass: 'bg-emerald-500',
  },
  error: {
    icon: XCircle,
    iconClass: 'text-rose-400',
    barClass: 'bg-rose-500',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-amber-400',
    barClass: 'bg-amber-500',
  },
  info: {
    icon: Info,
    iconClass: 'text-brand-400',
    barClass: 'bg-brand-500',
  },
}

export default function Toast() {
  const { toast, showToast } = useApp()
  const config = typeConfig[toast?.type] || typeConfig.info
  const Icon = config.icon

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed bottom-6 right-6 z-[9999] toast max-w-sm w-full"
        >
          {/* Progress bar */}
          <div className="absolute inset-x-0 bottom-0 h-0.5 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${config.barClass}`}
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 4, ease: 'linear' }}
            />
          </div>

          <Icon className={`h-5 w-5 flex-shrink-0 ${config.iconClass}`} />
          <p className="flex-1">{toast.message}</p>
          <button
            onClick={() => showToast(null)}
            className="ml-2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
