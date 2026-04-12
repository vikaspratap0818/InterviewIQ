import { Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu } from 'lucide-react'
import Sidebar, { SidebarContent } from '../components/Sidebar'
import Toast from '../components/Toast'

export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-bg text-white">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-[210px] sidebar lg:hidden"
            >
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex flex-1 flex-col min-w-0">
          {/* Mobile Top Bar */}
          <div className="flex items-center gap-3 border-b border-white/[0.06] bg-bg-secondary/80 backdrop-blur-xl px-4 py-3 lg:hidden">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-display font-bold text-white">InterviewIQ</span>
          </div>

          <main className="flex-1 overflow-auto p-3 md:p-4 lg:p-5">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Global Toast */}
      <Toast />
    </div>
  )
}
