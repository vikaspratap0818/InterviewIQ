import { motion } from 'framer-motion'

export default function GlassCard({ children, className = '', hover = true }) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      transition={{ duration: 0.2 }}
      className={`glass rounded-3xl ${className}`}
    >
      {children}
    </motion.div>
  )
}
