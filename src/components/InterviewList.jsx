export default function InterviewList({ items }) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-2xl border border-blue-300/20 bg-white/[0.03] p-4 shadow-neon"
        >
          <div className="flex items-center gap-3">
            <img src={item.avatar} alt={item.name} className="h-12 w-12 rounded-full object-cover" />
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-slate-300">{item.role}</p>
              <p className="text-sm text-slate-400">{item.time}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
