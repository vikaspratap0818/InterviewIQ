import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  BrainCircuit,
  Bot,
  BarChart3,
  Settings,
  LogOut,
  Mic,
  Sparkles,
  ChevronRight,
  X,
} from 'lucide-react'
import { useApp } from '../context/AppContext'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard', badge: null },
  { label: 'Interview Setup', icon: BrainCircuit, to: '/setup', badge: null },
  { label: 'AI Interviewer', icon: Bot, to: '/interview', badge: 'Live' },
  { label: 'Voice Practice', icon: Mic, to: '/voice-interview', badge: 'AI' },
  { label: 'Analytics', icon: BarChart3, to: '/performance', badge: null },
  { label: 'Settings', icon: Settings, to: '/settings', badge: null },
]

function Avatar({ name, size = 'md' }) {
  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'
  const sizeClass = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm'
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-brand flex items-center justify-center font-bold text-white flex-shrink-0`}>
      {initials}
    </div>
  )
}

export function SidebarContent({ onClose }) {
  const { user, logout } = useApp()
  const navigate = useNavigate()

  const handleLogout = () => {
    if (onClose) onClose()
    logout()
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 pt-5 pb-6">
        <button
          onClick={() => { navigate('/dashboard'); if (onClose) onClose() }}
          className="flex items-center gap-2.5"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand shadow-glow-sm">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-display text-lg font-bold text-white tracking-tight">InterviewIQ</span>
          </div>
        </button>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 overflow-y-auto">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-widest text-slate-600">
          Navigation
        </p>
        {navItems.map(({ label, icon: Icon, to, badge }) => (
          <NavLink
            key={label}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `nav-link group ${isActive ? 'active' : ''}`
            }
          >
            <Icon className="h-4.5 w-4.5 flex-shrink-0" style={{ width: '1.125rem', height: '1.125rem' }} />
            <span className="flex-1">{label}</span>
            {badge && (
              <span className="badge badge-brand text-[10px] px-1.5 py-0.5">{badge}</span>
            )}
            <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-40 transition-opacity" />
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="px-3 pb-4 pt-3 border-t border-white/[0.06] space-y-2">
        {/* User card */}
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-2.5">
          <Avatar name={user?.name} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email || ''}</p>
          </div>
          <div className="h-2 w-2 rounded-full bg-emerald-400 flex-shrink-0" title="Online" />
        </div>

        <button
          onClick={handleLogout}
          className="nav-link w-full justify-start text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 hover:border-rose-500/10"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  )
}

export default function Sidebar() {
  return (
    <aside className="sidebar hidden w-[210px] flex-shrink-0 lg:flex lg:flex-col">
      <SidebarContent />
    </aside>
  )
}
