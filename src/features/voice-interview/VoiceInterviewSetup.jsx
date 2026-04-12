import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mic, Briefcase, Layers, Sparkles } from 'lucide-react'
import Card from '../../components/Card'
import Button from '../../components/Button'

const ROLES = ['Software Engineer','Frontend Developer','Backend Developer','Full Stack Developer','Data Scientist','Product Manager','UX Designer','DevOps Engineer']
const LEVELS = ['Intern','Junior','Mid-Level','Senior','Lead','Principal']

export default function VoiceInterviewSetup({ onStart }) {
  const [role, setRole] = useState('Software Engineer')
  const [level, setLevel] = useState('Mid-Level')
  const [customRole, setCustomRole] = useState('')
  const [useCustom, setUseCustom] = useState(false)

  const handleStart = () => {
    const finalRole = useCustom && customRole.trim() ? customRole.trim() : role
    onStart({ role: finalRole, level })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl">
      <Card hover={false} className="p-8 border-brand-500/20">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand shadow-glow-sm">
            <Mic className="h-8 w-8 text-white" />
          </div>
          <h2 className="font-display text-2xl font-bold text-white">Voice Interview Setup</h2>
          <p className="text-sm text-slate-400">Configure your mock interview. The AI will ask questions aloud and evaluate your spoken answers.</p>
        </div>

        <div className="mb-6">
          <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-300 uppercase tracking-widest">
            <Briefcase className="h-4 w-4 text-brand-400" /> Target Role
          </label>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((r) => (
              <button key={r} onClick={() => { setRole(r); setUseCustom(false) }}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${!useCustom && role === r ? 'bg-brand-500 text-white shadow-glow-sm' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'}`}>
                {r}
              </button>
            ))}
            <button onClick={() => setUseCustom(true)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${useCustom ? 'bg-brand-500 text-white shadow-glow-sm' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'}`}>
              Custom...
            </button>
          </div>
          {useCustom && (
            <input type="text" placeholder="e.g. Machine Learning Engineer" value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              className="mt-4 w-full rounded-xl bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-slate-600 ring-1 ring-white/10 focus:outline-none focus:ring-brand-500/50 focus:border-brand-500/50 transition-all" />
          )}
        </div>

        <div className="mb-8">
          <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-300 uppercase tracking-widest">
            <Layers className="h-4 w-4 text-brand-400" /> Experience Level
          </label>
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((l) => (
              <button key={l} onClick={() => setLevel(l)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${level === l ? 'bg-brand-500 text-white shadow-glow-sm' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8 rounded-2xl bg-brand-500/5 p-5 ring-1 ring-brand-500/20">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-400">How it works</p>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-brand-400" /> The AI asks a question and speaks it aloud</li>
            <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-brand-400" /> Tap the microphone to record your answer</li>
            <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-brand-400" /> Tap again to stop and submit</li>
            <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-brand-400" /> Get real-time conversational feedback and final scores</li>
          </ul>
        </div>

        <div className="flex justify-center">
          <Button size="xl" onClick={handleStart} icon={Sparkles} className="w-full max-w-sm">
            Initialize Interview
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}