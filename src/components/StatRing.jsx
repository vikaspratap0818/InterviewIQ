import { motion } from 'framer-motion'

export default function StatRing({ value, label, color = 'brand' }) {
  const angle = Math.round((value / 100) * 360)
  
  const colors = {
    brand: {
      gradient: '#6366F1',
      bg: 'bg-brand-500/10',
      text: 'text-brand-400'
    },
    emerald: {
      gradient: '#10B981',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400'
    },
    amber: {
      gradient: '#F59E0B',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400'
    }
  }
  
  const c = colors[color] || colors.brand

  return (
    <div className="card p-6 flex flex-col items-center justify-center text-center">
      <div className="relative mb-4">
        {/* Outer Glow */}
        <div 
          className="absolute inset-0 rounded-full blur-xl opacity-30" 
          style={{ background: c.gradient }}
        />
        
        {/* Ring Setup */}
        <div
          className="relative grid h-28 w-28 place-items-center rounded-full"
          style={{
            background: `conic-gradient(${c.gradient} ${angle}deg, rgba(255,255,255,0.05) ${angle}deg)`,
          }}
        >
          {/* Inner cut-out */}
          <div className="grid h-[6.5rem] w-[6.5rem] place-items-center rounded-full bg-panel shadow-[inset_0_4px_10px_rgba(0,0,0,0.5)]">
            <span className={`font-display text-2xl font-bold ${c.text}`}>
              {value}%
            </span>
          </div>
        </div>
      </div>
      <p className="font-medium text-slate-300">{label}</p>
    </div>
  )
}
