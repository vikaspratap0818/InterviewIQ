import { PlayCircle } from 'lucide-react'

export default function RecordingsList({ items }) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-3 rounded-2xl border border-fuchsia-300/15 bg-white/[0.03] p-3 shadow-neon"
        >
          <div className="relative">
            <img src={item.avatar} alt={item.name} className="h-16 w-24 rounded-xl object-cover" />
            <PlayCircle className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-blue-300" />
          </div>
          <div>
            <p className="font-semibold">{item.name}</p>
            <p className="text-sm text-slate-300">{item.role}</p>
            <p className="text-sm text-slate-400">{item.date}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
