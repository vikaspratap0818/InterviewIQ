import { motion, AnimatePresence } from 'framer-motion'

export default function TranscriptPanel({ interimText, finalTranscript, isRecording }) {
  const hasContent = finalTranscript || (isRecording && interimText)

  return (
    <div className="glass-soft min-h-[120px] w-full rounded-2xl border border-white/10 p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">Your Answer</p>
      <AnimatePresence mode="wait">
        {!hasContent ? (
          <motion.p key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-sm italic text-slate-600">
            Your answer will appear here…
          </motion.p>
        ) : (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {finalTranscript && <p className="text-sm leading-relaxed text-white">{finalTranscript}</p>}
            {isRecording && interimText && <span className="text-sm italic text-slate-400"> {interimText}</span>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}