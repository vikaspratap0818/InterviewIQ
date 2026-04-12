import { motion } from 'framer-motion'

export default function GlowButton({
  children,
  className = '',
  onClick,
  type = 'button',
  full = false,
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      type={type}
      onClick={onClick}
      className={`rounded-full bg-btn-gradient px-7 py-3 font-semibold text-white shadow-glowBtn transition-all duration-300 hover:brightness-110 ${full ? 'w-full' : ''} ${className}`}
    >
      {children}
    </motion.button>
  )
}
