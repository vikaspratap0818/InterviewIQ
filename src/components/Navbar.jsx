import { BrainCircuit } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import GlowButton from './GlowButton'
import { useApp } from '../context/AppContext'

export default function Navbar() {
  const { user } = useApp()
  const navigate = useNavigate()

  return (
    <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
      <Link to="/" className="flex items-center gap-2 font-bold text-white">
        <div className="rounded-xl border border-cyan-300/20 bg-white/5 p-2 shadow-neon">
          <BrainCircuit className="h-5 w-5 text-cyan-300" />
        </div>
        <span className="text-xl">AI-Hire</span>
      </Link>

      <nav className="hidden items-center gap-8 text-sm text-slate-200 md:flex">
        <a href="#solutions" className="hover:text-white">Solutions</a>
        <a href="#features" className="hover:text-white">Features</a>
        <a href="#pricing" className="hover:text-white">Pricing</a>
      </nav>

      {user ? (
        <GlowButton className="px-5 py-2 text-sm" onClick={() => navigate('/dashboard')}>
          Dashboard
        </GlowButton>
      ) : (
        <button
          onClick={() => navigate('/login')}
          className="rounded-xl border border-white/15 bg-white/5 px-5 py-2 text-sm text-white transition hover:bg-white/10"
        >
          Login
        </button>
      )}
    </header>
  )
}
