import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, BrainCircuit, Mic, BarChart3, CheckCircle2, ChevronRight } from 'lucide-react'
import Button from '../components/Button'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen bg-bg text-white selection:bg-brand-500/30 selection:text-white">
      {/* ── Navbar ── */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.04] bg-bg/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand shadow-glow-sm">
              <Sparkles className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">InterviewIQ</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <Link to="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</Link>
            <Link to="#how-it-works" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">How it works</Link>
            <Link to="#pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Sign in</Link>
            <Button size="sm" onClick={() => navigate('/login')}>Get Started</Button>
          </div>
        </div>
      </nav>

      <main className="relative pt-24 pb-12">
        {/* ── Background Effects ── */}
        <div className="pointer-events-none absolute inset-0 flex justify-center overflow-hidden">
          <div className="absolute top-[20%] h-[500px] w-[800px] rounded-full bg-brand-500/20 blur-[120px] opacity-50 mix-blend-screen" />
          <div className="absolute top-[10%] right-[20%] h-[400px] w-[600px] rounded-full bg-purple-500/20 blur-[100px] opacity-40 mix-blend-screen" />
          <div className="absolute top-[30%] left-[20%] h-[600px] w-[600px] rounded-full bg-cyan-500/10 blur-[150px] opacity-50 mix-blend-screen" />
        </div>
        <div className="pointer-events-none absolute inset-0 grid-pattern opacity-40" />

        {/* ── Hero Section ── */}
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-center text-center mt-6 lg:mt-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm font-medium text-brand-400 shadow-[0_0_20px_rgba(99,102,241,0.15)] mb-8"
            >
              <Sparkles className="h-4 w-4" />
              <span>Introducing Voice AI Mock Interviews</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.5rem] lg:leading-[1.15]"
            >
              Master your next interview <br className="hidden lg:block" />
              with <span className="gradient-text">AI precision</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto mt-4 max-w-2xl text-base text-slate-400 leading-relaxed sm:text-lg"
            >
              Stop practicing in the mirror. Experience realistic, role-specific mock interviews with advanced AI that listens, evaluates, and gives actionable feedback instantly.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row items-center gap-4"
            >
              <Button size="xl" onClick={() => navigate('/login')} iconRight={ArrowRight}>
                Start Practicing Free
              </Button>
              <Button size="xl" variant="outline" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                View Features
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 flex items-center justify-center gap-4 text-sm text-slate-500"
            >
              <div className="flex -space-x-2">
                {[11, 32, 12, 20].map(img => (
                  <img key={img} className="inline-block h-8 w-8 rounded-full ring-2 ring-bg" src={`https://i.pravatar.cc/100?img=${img}`} alt="" />
                ))}
              </div>
              <span>Joined by 10,000+ professionals</span>
            </motion.div>
          </div>

          {/* ── App Preview (Mockup) ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-20 relative mx-auto w-full max-w-5xl rounded-2xl border border-white/10 bg-panel px-4 pb-4 pt-14 shadow-2xl overflow-hidden glass-strong"
          >
            {/* Mac style window controls */}
            <div className="absolute top-4 left-4 flex gap-2">
              <div className="h-3 w-3 rounded-full bg-rose-500/80" />
              <div className="h-3 w-3 rounded-full bg-amber-500/80" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="absolute top-3 left-0 right-0 text-center text-xs font-medium text-slate-500">
              Live Interview Room
            </div>

            <div className="rounded-xl border border-white/5 bg-bg overflow-hidden aspect-[16/9] relative grid place-items-center">
               <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-purple-500/5" />
               <div className="flex flex-col items-center gap-6 z-10">
                 <div className="relative">
                   <div className="absolute inset-0 bg-brand-500 blur-2xl opacity-20 rounded-full animate-pulse-glow" />
                   <div className="h-24 w-24 bg-panel2 rounded-full border border-brand-500/30 flex items-center justify-center relative overflow-hidden">
                     <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-brand-500/20 to-transparent" />
                     <Mic className="h-10 w-10 text-brand-400" />
                   </div>
                 </div>
                 <div className="text-center space-y-2">
                    <div className="text-lg font-medium text-white">"Tell me about a time you optimized a slow query."</div>
                    <div className="flex items-center justify-center gap-1.5 text-sm text-brand-400">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                      </span>
                      AI is listening...
                    </div>
                 </div>
               </div>
            </div>
          </motion.div>
        </div>

        {/* ── Features ── */}
        <div id="features" className="relative z-10 mx-auto mt-32 max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-brand-400 font-semibold tracking-wide uppercase text-sm">Features</h2>
            <p className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl text-white">Everything you need to ace it.</p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: 'Real-time Voice Voice',
                description: 'Speak your answers instead of typing. Experience the pressure and flow of a real conversation.',
                icon: Mic,
                color: 'text-brand-400'
              },
              {
                title: 'Contextual AI',
                description: 'Upload your resume and the target job description. The AI tailors every question specifically to you.',
                icon: BrainCircuit,
                color: 'text-purple-400'
              },
              {
                title: 'Actionable Insights',
                description: 'Get graded on communication, technical accuracy, and confidence with detailed improvement suggestions.',
                icon: BarChart3,
                color: 'text-cyan-400'
              }
            ].map((f, i) => (
              <div key={i} className="card p-8 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity" />
                <f.icon className={`h-8 w-8 ${f.color} mb-6`} />
                <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="relative z-10 mx-auto mt-32 max-w-5xl px-6 lg:px-8 mb-20">
          <div className="glass-strong rounded-3xl overflow-hidden relative border border-brand-500/30 p-12 text-center text-white">
            <div className="absolute inset-0 bg-gradient-brand opacity-10 mix-blend-overlay" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />
            
            <div className="relative z-10">
              <h2 className="font-display text-4xl font-bold mb-4">Ready to land your dream job?</h2>
              <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                Join thousands of candidates who have successfully leveled up their interview skills with InterviewIQ.
              </p>
              <Button size="xl" onClick={() => navigate('/login')} className="shadow-[0_0_40px_rgba(99,102,241,0.5)]">
                Create Free Account
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] bg-bg py-12 relative z-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 sm:flex-row lg:px-8">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-400" />
            <span className="font-display font-bold">InterviewIQ</span>
          </div>
          <p className="text-sm text-slate-500">© 2026 InterviewIQ Inc. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
