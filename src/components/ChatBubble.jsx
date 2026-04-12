import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, User, Sparkles, TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

export function TypingIndicator({ time }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 flex w-full gap-4 flex-row"
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl shadow-sm bg-gradient-brand text-white shadow-glow-sm">
        <Sparkles className="h-5 w-5" />
      </div>

      <div className="flex max-w-[85%] flex-col items-start">
        <div className="flex items-center gap-2 mb-1.5 px-1">
          <span className="text-xs font-medium text-slate-400">Interviewer</span>
          <span className="text-[10px] text-slate-500">{time}</span>
        </div>
        
        <div className="relative px-5 py-3.5 rounded-2xl rounded-tl-sm bg-[#1A2235] text-slate-200 border border-white/5 flex items-center gap-1.5 min-w-[60px] min-h-[40px]">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0 }}
            className="h-1.5 w-1.5 rounded-full bg-brand-400"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
            className="h-1.5 w-1.5 rounded-full bg-brand-400"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
            className="h-1.5 w-1.5 rounded-full bg-brand-400"
          />
        </div>
      </div>
    </motion.div>
  )
}

export default function ChatBubble({ sender, text, time, evaluation }) {
  const isAi = sender === 'ai'
  const [showFeedback, setShowFeedback] = useState(false)

  const score = evaluation?.score ?? 0
  const getScoreColor = (s) => {
    if (s >= 8) return 'text-emerald-400'
    if (s >= 5) return 'text-amber-400'
    return 'text-rose-400'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-6 flex w-full gap-4 ${isAi ? 'flex-row' : 'flex-row-reverse'}`}
    >
      {/* Avatar */}
      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl shadow-sm ${
        isAi 
          ? 'bg-gradient-brand text-white shadow-glow-sm' 
          : 'bg-white/10 text-slate-300 border border-white/20'
      }`}>
        {isAi ? <Sparkles className="h-5 w-5" /> : <User className="h-5 w-5" />}
      </div>

      {/* Bubble */}
      <div className={`flex max-w-[85%] flex-col ${isAi ? 'items-start' : 'items-end'}`}>
        <div className="flex items-center gap-2 mb-1.5 px-1">
          <span className="text-xs font-medium text-slate-400">{isAi ? 'Interviewer' : 'You'}</span>
          <span className="text-[10px] text-slate-500">{time}</span>
        </div>
        
        <div className={`relative px-5 py-3.5 text-[15px] leading-relaxed shadow-sm ${
          isAi 
            ? 'rounded-2xl rounded-tl-sm bg-[#1A2235] text-slate-200 border border-white/5' 
            : 'rounded-2xl rounded-tr-sm bg-brand-500/20 text-white border border-brand-500/30'
        }`}>
          {text}
        </div>

        {/* Evaluation Feedback Accordion */}
        {evaluation && (
          <div className="mt-3 w-full">
            <button
              onClick={() => setShowFeedback(!showFeedback)}
              className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-4 py-2 text-xs font-semibold transition-all hover:bg-white/[0.06]"
            >
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold ${getScoreColor(score)}`}>Score: {score}/10</span>
                <span className="h-1 w-1 rounded-full bg-white/20" />
                <span className="text-slate-400">View Feedback</span>
              </div>
              {showFeedback ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 space-y-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <p className="text-sm leading-relaxed text-slate-300">
                      <span className="font-bold text-brand-400 mr-2">Review:</span>
                      {evaluation.feedback}
                    </p>
                    
                    <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
                      {evaluation.strengths?.length > 0 && (
                        <div>
                          <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                            <TrendingUp className="h-3 w-3" /> Strengths
                          </p>
                          <ul className="space-y-1">
                            {evaluation.strengths.map((s, i) => (
                              <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                                <span className="mt-1.5 h-1 w-1 rounded-full bg-emerald-400 flex-shrink-0" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {evaluation.improvements?.length > 0 && (
                        <div>
                          <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-rose-400">
                            <TrendingDown className="h-3 w-3" /> To Improve
                          </p>
                          <ul className="space-y-1">
                            {evaluation.improvements.map((s, i) => (
                              <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                                <span className="mt-1.5 h-1 w-1 rounded-full bg-rose-400 flex-shrink-0" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  )
}
