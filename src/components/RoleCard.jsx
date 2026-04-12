import { motion } from 'framer-motion'

export default function RoleCard({ title, description, active, onClick, icon }) {
  return (
    <motion.button
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`rounded-2xl border p-5 text-left transition ${
        active
          ? 'border-blue-300/35 bg-white/10 shadow-neon'
          : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
      }`}
    >
      <div className="mb-3 text-lg">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
    </motion.button>
  )
}
