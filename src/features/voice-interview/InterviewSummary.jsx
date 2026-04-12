import { motion } from 'framer-motion'
import { CheckCircle2, Star, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import Card from '../../components/Card'
import Button from '../../components/Button'

export default function InterviewSummary({ results, overallSummary, role, onRestart }) {
  const avgScore = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + (r.evaluation?.score ?? 0), 0) / results.length)
    : 0

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400'
    if (score >= 60) return 'text-amber-400'
    return 'text-rose-400'
  }
  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-emerald-500/10 border-emerald-500/20'
    if (score >= 60) return 'bg-amber-500/10 border-amber-500/20'
    return 'bg-rose-500/10 border-rose-500/20'
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-4xl space-y-8">
      
      {/* ── Main Score Card ── */}
      <Card hover={false} className="flex flex-col items-center gap-4 px-8 py-10 text-center border-brand-500/30 bg-gradient-to-b from-brand-500/10 to-transparent">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>
        <div>
          <h2 className="font-display text-4xl font-bold text-white tracking-tight">Interview Complete</h2>
          <p className="mt-2 text-lg text-slate-400">
            You completed {results.length} questions for the role of <span className="font-medium text-white">{role}</span>
          </p>
        </div>
        
        <div className="mt-6 flex flex-col items-center justify-center">
          <div className={`font-display text-7xl font-black tracking-tighter ${getScoreColor(avgScore)}`} style={{ textShadow: '0 0 40px currentColor' }}>
            {avgScore}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-widest text-slate-400">
            <Star className="h-4 w-4 text-brand-400" /> Overall Score
          </div>
        </div>
        
        {overallSummary && (
          <div className="mt-6 max-w-2xl rounded-2xl bg-white/[0.03] border border-white/5 p-6">
            <p className="text-sm leading-relaxed text-slate-300 font-medium">"{overallSummary}"</p>
          </div>
        )}
      </Card>

      {/* ── Question Breakdown ── */}
      <div>
        <h3 className="font-display text-2xl font-bold text-white mb-6">Detailed Breakdown</h3>
        <div className="space-y-6">
          {results.map((result, idx) => {
            const score = result.evaluation?.score ?? 0
            return (
              <motion.div key={idx} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}>
                <Card hover={false} className="p-6">
                  <div className="flex items-start gap-6">
                    {/* Score Circle */}
                    <div className={`flex flex-col items-center justify-center h-20 w-20 flex-shrink-0 border rounded-2xl ${getScoreBg(score)}`}>
                      <span className={`font-display text-2xl font-bold ${getScoreColor(score)}`}>{score}</span>
                      <span className="text-[10px] uppercase font-semibold text-slate-500">/ 100</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="inline-flex items-center rounded bg-white/10 px-2 py-0.5 text-xs font-semibold text-slate-300">Q{idx + 1}</span>
                      </div>
                      <h4 className="text-lg font-semibold text-white mb-3">{result.question}</h4>
                      
                      <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 mb-4">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1 block">Your Answer</span>
                        <p className="text-sm text-slate-300 italic">
                          {result.answer ? `"${result.answer}"` : "No answer provided"}
                        </p>
                      </div>

                      {result.evaluation && (
                        <div className="space-y-4">
                          <p className="text-sm font-medium text-slate-200">
                            <span className="text-brand-400 font-semibold mr-2">Feedback:</span>
                            {result.evaluation.feedback}
                          </p>

                          <div className="grid sm:grid-cols-2 gap-4 border-t border-white/5 pt-4">
                            {result.evaluation.strengths?.length > 0 && (
                              <div>
                                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-400">
                                  <TrendingUp className="h-3.5 w-3.5" /> Strengths
                                </p>
                                <ul className="space-y-1.5">
                                  {result.evaluation.strengths.map((s, i) => (
                                    <li key={i} className="text-sm text-slate-400 flex items-start gap-1.5">
                                      <span className="mt-1 h-1 w-1 rounded-full bg-emerald-400 flex-shrink-0" />
                                      {s}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {result.evaluation.improvements?.length > 0 && (
                              <div>
                                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-rose-400">
                                  <TrendingDown className="h-3.5 w-3.5" /> Improvements
                                </p>
                                <ul className="space-y-1.5">
                                  {result.evaluation.improvements.map((s, i) => (
                                    <li key={i} className="text-sm text-slate-400 flex items-start gap-1.5">
                                      <span className="mt-1 h-1 w-1 rounded-full bg-rose-400 flex-shrink-0" />
                                      {s}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
      
      <div className="flex justify-center pt-8 pb-16">
        <Button size="xl" onClick={onRestart} icon={RefreshCw}>Start New Interview</Button>
      </div>
    </motion.div>
  )
}