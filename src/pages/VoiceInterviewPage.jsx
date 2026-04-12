import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  SkipForward,
  Volume2,
  VolumeX,
  Sparkles,
} from "lucide-react";

import PageTransition from "../components/PageTransition";
import Card from "../components/Card";
import Button from "../components/Button";

import VoiceInterviewSetup from "../features/voice-interview/VoiceInterviewSetup";
import VoiceRecorder from "../features/voice-interview/VoiceRecorder";
import TranscriptPanel from "../features/voice-interview/TranscriptPanel";
import InterviewSummary from "../features/voice-interview/InterviewSummary";
import useVoiceRecorder from "../features/voice-interview/useVoiceRecorder";
import useSpeechSynthesis from "../features/voice-interview/useSpeechSynthesis";
import {
  generateInterviewQuestions,
  evaluateAnswer,
  generateInterviewSummary,
  getNextQuestion,
} from "../features/voice-interview/AIInterviewEngine";

// Interview states
const STAGE = {
  SETUP: "setup",
  LOADING: "loading",
  ASKING: "asking",
  LISTENING: "listening",
  EVALUATING: "evaluating",
  SUMMARY: "summary",
};

export default function VoiceInterviewPage() {
  const [stage, setStage] = useState(STAGE.SETUP);
  const [config, setConfig] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(6);
  const [results, setResults] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [overallSummary, setOverallSummary] = useState("");
  const [ttsMuted, setTtsMuted] = useState(false);
  const [error, setError] = useState("");

  const finalAnswerRef = useRef("");

  const { isSpeaking, speak, cancel: cancelSpeech } = useSpeechSynthesis();

  const handleFinalTranscript = useCallback((text) => {
    console.log("[VoicePage] Received final transcript:", text);
    finalAnswerRef.current = (finalAnswerRef.current + ' ' + text).trim()
    setCurrentAnswer(finalAnswerRef.current)
  }, [])

  const handleInterimTranscript = useCallback((text) => {
    // We don't save interim results to the final answer ref, 
    // but we can pass it to the UI if needed via the interimText state from the hook
  }, [])

  const { isRecording, isSupported, interimText, startRecording, stopRecording } =
    useVoiceRecorder({
      onTranscript: handleInterimTranscript,
      onFinalTranscript: handleFinalTranscript,
    });

  // Auto-stop recording if AI starts speaking
  useEffect(() => {
    if (isSpeaking && isRecording) {
      console.log("[VoicePage] AI started speaking, pausing recording");
      stopRecording();
    }
  }, [isSpeaking, isRecording, stopRecording]);

  useEffect(() => {
    if (stage === STAGE.ASKING && currentQuestion && !ttsMuted) {
      speak(currentQuestion);
    }
  }, [stage, currentQuestion]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStart = async ({ role, level }) => {
    setConfig({ role, level });
    setStage(STAGE.LOADING);
    setError("");
    try {
      // Check for mic permissions early
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (permErr) {
        throw new Error(
          "Microphone access denied. Please allow microphone permissions in your browser settings.",
        );
      }

      const qs = await generateInterviewQuestions({ role, level, count: 6 });
      setCurrentQuestion(qs[0]);
      setCurrentIdx(0);

      const totalQs = window.__voiceInterviewSession?.totalQuestions || 6;
      setTotalQuestions(totalQs);

      setResults([]);
      setCurrentAnswer("");
      finalAnswerRef.current = "";
      setStage(STAGE.ASKING);
    } catch (err) {
      setError(err.message || "Failed to load questions. Please try again.");
      setStage(STAGE.SETUP);
    }
  };

  const handleSubmitAnswer = async () => {
    if (isRecording) stopRecording();
    cancelSpeech();

    const answer = finalAnswerRef.current.trim();
    setStage(STAGE.EVALUATING);

    let evaluation = null;
    try {
      evaluation = await evaluateAnswer({
        question: currentQuestion,
        answer,
        role: config.role,
      });
    } catch {
      evaluation = {
        score: 0,
        feedback: "Evaluation failed.",
        strengths: [],
        improvements: [],
      };
    }

    const newResults = [
      ...results,
      { question: currentQuestion, answer, evaluation },
    ];
    setResults(newResults);

    // Check if there's a next question from the backend
    const nextQ = getNextQuestion();

    if (!nextQ) {
      // Interview is complete
      setStage(STAGE.LOADING);
      try {
        const summary = await generateInterviewSummary({
          role: config.role,
          level: config.level,
          results: newResults,
        });
        setOverallSummary(
          typeof summary === "string"
            ? summary
            : summary.summary || "Interview complete!",
        );
      } catch {
        setOverallSummary("Interview complete. Great effort!");
      }
      setStage(STAGE.SUMMARY);
    } else {
      setCurrentIdx((i) => i + 1);
      setCurrentQuestion(nextQ);
      setCurrentAnswer("");
      finalAnswerRef.current = "";
      setStage(STAGE.ASKING);
    }
  };

  const handleSkip = () => {
    if (isRecording) stopRecording();
    cancelSpeech();
    finalAnswerRef.current = "";
    setCurrentAnswer("");

    const newResults = [
      ...results,
      {
        question: currentQuestion,
        answer: "",
        evaluation: {
          score: 0,
          feedback: "Skipped.",
          strengths: [],
          improvements: [],
        },
      },
    ];
    setResults(newResults);

    // For skip, we need to evaluate to get next question
    evaluateAnswer({
      question: currentQuestion,
      answer: "(Skipped)",
      role: config?.role,
    })
      .then(() => {
        const nextQ = getNextQuestion();
        if (!nextQ) {
          setStage(STAGE.SUMMARY);
        } else {
          setCurrentIdx((i) => i + 1);
          setCurrentQuestion(nextQ);
          setStage(STAGE.ASKING);
        }
      })
      .catch(() => {
        setStage(STAGE.SUMMARY);
      });
  };

  const handleRestart = () => {
    cancelSpeech();
    setStage(STAGE.SETUP);
    setCurrentQuestion("");
    setResults([]);
    setCurrentAnswer("");
    finalAnswerRef.current = "";
    setOverallSummary("");
    setCurrentIdx(0);
    window.__voiceInterviewSession = null;
  };

  const handleMicToggle = () => {
    if (stage === STAGE.ASKING) setStage(STAGE.LISTENING);

    // If AI is speaking, interrupt it when user wants to talk
    if (isSpeaking) {
      console.log("[VoicePage] Interrupting AI speech");
      cancelSpeech();
    }

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-white flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-brand-400" />
              AI Voice Interview
            </h1>
            <p className="mt-1 text-slate-400">
              Speak naturally — the AI listens, evaluates, and guides you
            </p>
          </div>
          {stage !== STAGE.SETUP &&
            stage !== STAGE.LOADING &&
            stage !== STAGE.SUMMARY && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTtsMuted((m) => !m)}
                icon={ttsMuted ? VolumeX : Volume2}
              >
                {ttsMuted ? "Unmute AI" : "Mute AI"}
              </Button>
            )}
        </div>

        {error && (
          <div className="rounded-2xl bg-rose-500/10 p-4 text-sm font-medium text-rose-400 ring-1 ring-rose-500/30 flex items-center justify-center">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {stage === STAGE.SETUP && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <VoiceInterviewSetup onStart={handleStart} />
            </motion.div>
          )}

          {stage === STAGE.LOADING && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex min-h-[400px] flex-col items-center justify-center gap-6"
            >
              <div className="relative h-20 w-20">
                <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-brand-400" />
                <div
                  className="absolute inset-2 animate-spin rounded-full border-[3px] border-transparent border-b-cyan-400"
                  style={{ animationDirection: "reverse" }}
                />
                <div className="absolute inset-4 animate-pulse rounded-full bg-brand-500/10 blur-sm" />
              </div>
              <p className="text-slate-400 font-medium tracking-wide">
                {results.length === 0
                  ? "Generating your personalized interview…"
                  : "Analyzing your interview…"}
              </p>
            </motion.div>
          )}

          {(stage === STAGE.ASKING ||
            stage === STAGE.LISTENING ||
            stage === STAGE.EVALUATING) && (
            <motion.div
              key="interview"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-6"
            >
              {/* Progress */}
              <div className="flex items-center gap-4">
                <div className="flex-1 overflow-hidden rounded-full bg-white/5 h-2">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-brand-500"
                    initial={false}
                    animate={{
                      width: `${(currentIdx / totalQuestions) * 100}%`,
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-500 tracking-wider">
                  {currentIdx + 1} / {totalQuestions}
                </span>
              </div>

              {/* Question Card */}
              <Card
                hover={false}
                className="p-8 border-brand-500/30 bg-brand-500/5 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-brand-500" />
                <div className="mb-4 flex items-center justify-between">
                  <span className="inline-flex items-center rounded-lg bg-brand-500/20 px-2.5 py-1 text-xs font-semibold text-brand-300 border border-brand-500/30">
                    Question {currentIdx + 1}
                  </span>
                  {isSpeaking && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-brand-400 uppercase tracking-widest">
                      <span className="inline-flex gap-0.5">
                        {[1, 2, 3].map((i) => (
                          <motion.span
                            key={i}
                            className="block h-3 w-0.5 rounded-full bg-brand-400"
                            animate={{ scaleY: [1, 2, 1] }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              delay: i * 0.15,
                            }}
                          />
                        ))}
                      </span>
                      AI Speaking
                    </span>
                  )}
                </div>
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={currentIdx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="text-2xl font-bold font-display leading-snug text-white"
                  >
                    {currentQuestion}
                  </motion.h2>
                </AnimatePresence>
              </Card>

              {/* Controls & Transcript */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col items-center justify-center py-4 lg:col-span-1 border border-white/5 bg-white/[0.02] rounded-2xl">
                  <VoiceRecorder
                    isRecording={isRecording}
                    isSupported={isSupported}
                    isSpeaking={isSpeaking}
                    onStart={handleMicToggle}
                    onStop={handleMicToggle}
                  />
                </div>
                <div className="lg:col-span-2">
                  <TranscriptPanel
                    interimText={interimText}
                    finalTranscript={currentAnswer}
                    isRecording={isRecording}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between border-t border-white/10 pt-6">
                <Button variant="ghost" onClick={handleSkip} icon={SkipForward}>
                  Skip Question
                </Button>
                <Button
                  onClick={handleSubmitAnswer}
                  loading={stage === STAGE.EVALUATING}
                  iconRight={ChevronRight}
                  className="px-8 shadow-glow-sm"
                >
                  {stage === STAGE.EVALUATING
                    ? "Evaluating..."
                    : "Submit Answer"}
                </Button>
              </div>
            </motion.div>
          )}

          {stage === STAGE.SUMMARY && (
            <motion.div
              key="summary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <InterviewSummary
                results={results}
                overallSummary={overallSummary}
                role={config?.role}
                onRestart={handleRestart}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
