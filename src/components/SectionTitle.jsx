export default function SectionTitle({ title, subtitle, className = '' }) {
  return (
    <div className={className}>
      <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">{title}</h2>
      {subtitle && <p className="mt-2 text-sm text-textSoft">{subtitle}</p>}
    </div>
  )
}
