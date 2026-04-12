import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Square } from 'lucide-react'

export default function VoiceRecorder({ isRecording, isSupported, isSpeaking, onStart, onStop }) {
  const canRecord = isSupported && !isSpeaking

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative flex items-center justify-center">
        {/* Radar Ping Effect */}
        <AnimatePresence>
          {isRecording && [1, 2, 3].map((i) => (
            <motion.span key={i} className="absolute rounded-full border border-rose-500/40"
              initial={{ width: 90, height: 90, opacity: 0.8 }}
              animate={{ width: 90 + i * 50, height: 90 + i * 50, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4, ease: 'easeOut' }}
            />
          ))}
        </AnimatePresence>

        <motion.button
          whileHover={canRecord ? { scale: 1.05 } : {}}
          whileTap={canRecord ? { scale: 0.95 } : {}}
          onClick={isRecording ? onStop : onStart}
          disabled={!canRecord}
          className={`relative z-10 flex h-24 w-24 items-center justify-center rounded-full shadow-lg transition-all duration-300
            ${isRecording 
              ? 'bg-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.6)]'
              : isSpeaking 
                ? 'cursor-not-allowed bg-white/5 border border-white/10'
                : 'bg-brand-500 shadow-[0_0_30px_rgba(99,102,241,0.5)]'}`}
        >
          {isRecording ? <Square className="h-8 w-8 fill-white text-white" />
            : !isSupported ? <MicOff className="h-8 w-8 text-white/50" />
            : <Mic className="h-8 w-8 text-white" />}
        </motion.button>
      </div>

      <div className="text-center">
        <p className={`text-sm font-semibold tracking-wider uppercase ${isRecording ? 'text-rose-400' : 'text-slate-400'}`}>
          {!isSupported ? 'Mic not supported'
            : isSpeaking ? 'AI is speaking'
            : isRecording ? 'Recording active'
            : 'Tap mic to reply'}
        </p>
        <p className="mt-1 text-xs text-slate-500">
           {isRecording ? 'Click square to submit' : 'Speak clearly into your microphone'}
        </p>
      </div>
    </div>
  )
}