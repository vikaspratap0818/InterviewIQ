import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Send,
  MessageSquare,
  HelpCircle,
  StopCircle,
  LogOut,
  Play,
  Code2,
  Terminal,
  Clock as ClockIcon,
  ArrowRight,
} from "lucide-react";
import PageTransition from "../components/PageTransition";
import ChatBubble, { TypingIndicator } from "../components/ChatBubble";
import CodeEditorPanel from "../components/CodeEditorPanel";
import Button from "../components/Button";
import { useApp } from "../context/AppContext";
import { io } from "socket.io-client";
import useVoiceRecorder from "../features/voice-interview/useVoiceRecorder";
import useSpeechSynthesis from "../features/voice-interview/useSpeechSynthesis";

export default function LiveInterviewPage() {
  const {
    messages,
    setMessages,
    sendMessage,
    code,
    setCode,
    timer,
    setTimer,
    activeSession,
    setActiveSession,
    endInterview,
    executeCode,
    runCompiler,
    showToast,
  } = useApp();
  const navigate = useNavigate();
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [codeOutput, setCodeOutput] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [codeLang, setCodeLang] = useState("python");
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const chatScrollRef = useRef(null);
  const socketRef = useRef(null);

  // Speech Synthesis
  const { speak, isSpeaking, cancel: cancelSpeech } = useSpeechSynthesis();

  // Voice Recording
  const handleTranscript = useCallback((text) => {
    // Only used for real-time interim display if we want to show it *inside* the textarea
    // But since it's a textarea, it's better to only show finalized text there
    // to avoid flickering and cursor jumping.
    // Instead, we'll let TranscriptPanel (if used) or a separate UI piece show interim.
    console.log("[Voice] Interim transcript:", text);
  }, []);

  const handleFinalTranscript = useCallback((text) => {
    console.log("[Voice] Final transcript segment:", text);
    setDraft((prev) => {
      const trimmedPrev = prev.trim();
      return trimmedPrev ? `${trimmedPrev} ${text}` : text;
    });
  }, []);

  const {
    isRecording,
    isSupported,
    interimText,
    startRecording,
    stopRecording,
  } = useVoiceRecorder({
    onTranscript: handleTranscript,
    onFinalTranscript: handleFinalTranscript,
  });

  // Initial greeting/question
  useEffect(() => {
    if (messages.length === 1 && messages[0].sender === "ai" && !isSpeaking) {
      // Wait a bit for voices to load
      setTimeout(() => {
        speak(messages[0].text, { persona: activeSession?.persona });
      }, 1000);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Socket Connection
  useEffect(() => {
    if (!activeSession?.sessionId) return;

    const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
      auth: { token: localStorage.getItem("iq-token") },
    });

    socket.on("connect", () => {
      console.log("[WS] Connected to interview session");
      socket.emit("join-interview", activeSession.sessionId);
    });

    socket.on("ai-question", (data) => {
      // Add AI response to chat
      const aiMessage = {
        id: Date.now(),
        sender: "ai",
        text:
          data.nextQuestion ||
          `Evaluation complete. Your score was ${data.evaluation.score}/10.`,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        evaluation: data.evaluation,
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsSending(false);

      // Speak the next question
      if (data.nextQuestion) {
        speak(data.nextQuestion, { persona: activeSession?.persona });
      }

      // Update session state
      setActiveSession((prev) => ({
        ...prev,
        currentIndex: data.nextIndex,
        isComplete: data.isComplete,
      }));

      if (data.isComplete) {
        showToast("Interview completed!", "success");
      }
    });

    socket.on("error", (err) => {
      showToast(err.message || "Socket error", "error");
      setIsSending(false);
    });

    socketRef.current = socket;
    return () => socket.disconnect();
  }, [activeSession?.sessionId, setMessages, setActiveSession, showToast]);

  // Timer logic
  useEffect(() => {
    const id = setInterval(() => {
      setTimer((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [setTimer]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatScrollRef.current;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 100;
      if (isAtBottom) {
        chatScrollRef.current.scrollTo({
          top: scrollHeight,
          behavior: "smooth",
        });
      } else {
        setShowScrollBottom(true);
      }
    }
  }, [messages, isSending]);

  const scrollToBottom = () => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: "smooth",
      });
      setShowScrollBottom(false);
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isAtBottom = scrollHeight - scrollTop <= clientHeight + 100;
    setShowScrollBottom(!isAtBottom);
  };

  const timeString = useMemo(() => {
    const m = String(Math.floor(timer / 60)).padStart(2, "0");
    const s = String(timer % 60).padStart(2, "0");
    return `${m}:${s}`;
  }, [timer]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || isSending) return;

    setIsSending(true);
    try {
      // If socket is connected, use it for real-time experience
      if (socketRef.current?.connected) {
        await sendMessage(text, socketRef.current);
      } else {
        const data = await sendMessage(text);
        if (data?.nextQuestion) {
          speak(data.nextQuestion, { persona: activeSession?.persona });
        }
      }
      setDraft("");
    } catch (err) {
      showToast(err.message || "Failed to send message", "error");
      setIsSending(false);
    }
  };

  const handleToggleVoice = () => {
    if (isRecording) {
      stopRecording();
      // Optional: auto-send on stop
      // handleSend()
    } else {
      if (!isSupported) {
        showToast(
          "Speech recognition is not supported in this browser.",
          "warning",
        );
        return;
      }
      startRecording();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEndInterview = async () => {
    const result = await endInterview();
    navigate("/performance");
  };

  const handleRunCode = async () => {
    if (!code.trim()) return;
    setIsExecuting(true);
    setCodeOutput(null);
    try {
      // If we have test cases from the active session, use the compiler run endpoint
      const currentQuestion =
        activeSession?.questions?.[activeSession.currentIndex];
      if (currentQuestion?.testCases?.length > 0) {
        const result = await runCompiler(
          code,
          codeLang,
          currentQuestion.testCases,
        );
        setCodeOutput(result);
      } else {
        // Fallback to standard execution
        const result = await executeCode(code, codeLang);
        setCodeOutput(result);
      }
    } catch (err) {
      setCodeOutput({ output: "", error: err.message, exitCode: 1 });
    } finally {
      setIsExecuting(false);
    }
  };

  const difficulty =
    activeSession?.currentIndex != null
      ? activeSession.currentIndex < 2
        ? "Easy"
        : activeSession.currentIndex < 4
          ? "Medium"
          : "Hard"
      : "Medium";

  return (
    <PageTransition>
      <div className="mx-auto flex h-[calc(100vh-6rem)] max-w-[1600px] flex-col gap-4">
        {/* ── Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-panel px-6 py-4 shadow-card">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 border border-brand-500/20 shadow-glow-sm">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-white">
                Live AI Interview
              </h1>
              <p className="text-xs font-medium text-slate-400">
                {activeSession?.role || "Software Engineer"} —{" "}
                {activeSession?.persona || "AI Interviewer"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2 font-mono text-sm font-medium ${timer < 300 ? "text-rose-400" : "text-slate-300"}`}
            >
              <ClockIcon className="h-4 w-4 opacity-70" />
              {timeString}
            </div>
            <div className="hidden rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 md:block">
              Difficulty:{" "}
              <span
                className={
                  difficulty === "Easy"
                    ? "text-emerald-400"
                    : difficulty === "Medium"
                      ? "text-amber-400"
                      : "text-rose-400"
                }
              >
                {difficulty}
              </span>
            </div>
            {activeSession && (
              <div className="hidden md:block rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-sm font-medium text-slate-300">
                Q {(activeSession.currentIndex || 0) + 1}/
                {activeSession.totalQuestions || "?"}
              </div>
            )}
            <Button variant="danger" onClick={handleEndInterview} icon={LogOut}>
              End Interview
            </Button>
          </div>
        </div>

        {/* ── Work Area ── */}
        <div className="grid flex-1 gap-4 xl:grid-cols-[400px_1fr] min-h-0">
          {/* ── Chat Panel ── */}
          <div className="flex flex-col relative min-h-[500px] xl:min-h-0 bg-panel border border-white/[0.08] rounded-3xl shadow-card overflow-hidden order-2 xl:order-1">
            <div
              className="flex-1 overflow-y-auto p-5 custom-scrollbar scroll-smooth"
              ref={chatScrollRef}
              onScroll={handleScroll}
            >
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <ChatBubble
                    key={msg.id}
                    sender={msg.sender}
                    text={msg.text}
                    time={msg.time}
                    evaluation={msg.evaluation}
                  />
                ))}
                {isSending && (
                  <TypingIndicator
                    time={new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Scroll to Bottom Button */}
            <AnimatePresence>
              {showScrollBottom && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onClick={scrollToBottom}
                  className="absolute bottom-32 right-6 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-white shadow-glow-sm hover:bg-brand-400"
                >
                  <ArrowRight className="h-5 w-5 rotate-90" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="border-t border-t-white/[0.08] bg-[#0E1320] p-4">
              <div className="relative flex flex-col gap-3">
                {/* Interim Voice Transcript */}
                {isRecording && interimText && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-12 left-0 right-0 p-3 bg-brand-500/20 border border-brand-500/30 rounded-xl text-sm italic text-brand-300 backdrop-blur-sm z-20"
                  >
                    <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-pulse mr-2" />
                    {interimText}
                  </motion.div>
                )}

                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your response or explain your code..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 pb-12 text-sm text-white placeholder-slate-500 transition-colors focus:border-brand-500/50 focus:bg-white/[0.05] focus:outline-none focus:ring-1 focus:ring-brand-500/50"
                  rows={3}
                  disabled={isSending}
                />

                {/* Formatting/Action Bar inside textarea */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button className="rounded-lg p-2 text-slate-500 hover:bg-white/10 hover:text-white transition-colors">
                      <MessageSquare className="h-4 w-4" />
                    </button>
                    <button className="rounded-lg p-2 text-slate-500 hover:bg-white/10 hover:text-white transition-colors">
                      <HelpCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleToggleVoice}
                      disabled={isSpeaking}
                      className={`ml-1 flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                        isRecording
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse"
                          : isSpeaking
                            ? "bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed"
                            : "bg-brand-500/10 text-brand-400 border border-brand-500/20 hover:bg-brand-500/20"
                      }`}
                    >
                      {isRecording ? (
                        <StopCircle className="h-3.5 w-3.5" />
                      ) : (
                        <Mic className="h-3.5 w-3.5" />
                      )}
                      {isRecording
                        ? "Recording..."
                        : isSpeaking
                          ? "AI Speaking..."
                          : "Speak"}
                    </button>
                  </div>
                  <button
                    onClick={handleSend}
                    disabled={!draft.trim() || isSending}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white transition-colors hover:bg-brand-400 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Editor Panel ── */}
          <div className="min-h-[500px] xl:min-h-0 flex flex-col gap-4 order-1 xl:order-2">
            <div className="flex-1 overflow-hidden">
              <CodeEditorPanel
                code={code}
                setCode={setCode}
                language={codeLang}
                setLanguage={setCodeLang}
                onRun={handleRunCode}
                isExecuting={isExecuting}
                results={codeOutput}
              />
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

// ClockIcon is already imported from lucide-react; remove duplicate declaration
