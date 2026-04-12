import { Outlet } from 'react-router-dom'
import Toast from '../components/Toast'

export default function AuthLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg flex items-center justify-center px-4 py-10">
      {/* Animated background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="orb h-[600px] w-[600px] -left-40 -top-40 bg-brand-500/10" />
        <div className="orb h-[500px] w-[500px] -right-40 -bottom-40 bg-accent-purple/10" style={{ animationDelay: '2s' }} />
        <div className="orb h-[300px] w-[300px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent-cyan/6" style={{ animationDelay: '1s' }} />
      </div>

      {/* Subtle grid */}
      <div className="pointer-events-none fixed inset-0 grid-pattern opacity-40" />

      <div className="relative z-10 w-full">
        <Outlet />
      </div>

      <Toast />
    </div>
  )
}
