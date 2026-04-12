import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
} from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import api from "../services/api";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useLocalStorage("iq-user", null);
  const [toast, setToast] = useState(null);
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);

  const [interviewSetup, setInterviewSetup] = useLocalStorage("iq-setup", {
    resumeName: null,
    resumeId: null,
    resumeParsed: null,
    jobDescription: "",
    persona: "Senior Tech Lead",
    role: "Software Engineer",
    level: "Mid-Level",
  });

  // Interview session state
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useLocalStorage("iq-messages", []);
  const [pastInterviews, setPastInterviews] = useLocalStorage(
    "iq-past-interviews",
    [],
  );

  const [code, setCode] = useLocalStorage(
    "iq-code",
    `def frequency_counter(arr):
    frequency = {}
    if not arr:
        return frequency

    for item in arr:
        frequency[item] = frequency.get(item, 0) + 1

    return frequency`,
  );

  const [timer, setTimer] = useState(45 * 60);

  // ── Toast ──────────────────────────────────────────
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // ── Auth: Listen for token expiry ──────────────────
  useEffect(() => {
    const handler = () => {
      setUser(null);
      showToast("Session expired. Please login again.", "error");
    };
    window.addEventListener("auth:expired", handler);
    return () => window.removeEventListener("auth:expired", handler);
  }, [setUser, showToast]);

  // ── Auth: Verify session on mount ──────────────────
  useEffect(() => {
    if (user && api.getToken()) {
      api
        .getMe()
        .then((data) => {
          setUser((prev) => ({ ...prev, ...data.user }));
        })
        .catch(() => {
          // Token invalid — clear session
          setUser(null);
          api.logout();
        });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Login ──────────────────────────────────────────
  const login = useCallback(
    async ({ email, password }) => {
      const data = await api.login({ email, password });
      setUser(data.user);
      showToast(`Welcome back, ${data.user.name}!`, "success");
      return data;
    },
    [setUser, showToast],
  );

  // ── Signup ─────────────────────────────────────────
  const signup = useCallback(
    async ({ email, password, name }) => {
      const data = await api.register({ email, password, name });
      setUser(data.user);
      showToast(`Account created! Welcome, ${data.user.name}!`, "success");
      return data;
    },
    [setUser, showToast],
  );

  // ── Google Login ───────────────────────────────────
  const loginWithGoogle = useCallback(
    async (credential) => {
      const data = await api.loginWithGoogle(credential);
      setUser(data.user);
      showToast(`Welcome, ${data.user.name}!`, "success");
      return data;
    },
    [setUser, showToast],
  );

  // ── Logout ─────────────────────────────────────────
  const logout = useCallback(() => {
    api.logout();
    setUser(null);
    setMessages([]);
    setPastInterviews([]);
    setActiveSession(null);
    localStorage.removeItem("iq-user");
    localStorage.removeItem("iq-messages");
    localStorage.removeItem("iq-past-interviews");
    localStorage.removeItem("iq-token");
    window.location.href = "/login";
  }, [setUser, setMessages, setPastInterviews]);

  // ── Resume Upload ──────────────────────────────────
  const uploadResume = useCallback(
    async (file) => {
      const data = await api.uploadResume(file);
      setInterviewSetup((prev) => ({
        ...prev,
        resumeName: data.filename,
        resumeId: data.id,
        resumeParsed: {
          skills: data.skills || [],
          experience: data.experience || [],
          projects: data.projects || [],
        },
      }));
      return data;
    },
    [setInterviewSetup],
  );

  // ── Start Interview ────────────────────────────────
  const startInterview = useCallback(
    async (config = {}) => {
      setIsGlobalLoading(true);
      try {
        const setup = { ...interviewSetup, ...config };
        const data = await api.startInterview({
          role: setup.role || "Software Engineer",
          persona: setup.persona || "Senior Tech Lead",
          level: setup.level || "Mid-Level",
          resumeId: setup.resumeId,
          jobDescription: setup.jobDescription,
          questionCount: config.questionCount || 6,
        });

        setActiveSession({
          sessionId: data.sessionId,
          totalQuestions: data.totalQuestions,
          currentQuestion: data.currentQuestion,
          currentIndex: data.currentIndex,
          role: setup.role,
          persona: setup.persona,
        });

        setMessages([
          {
            id: Date.now(),
            sender: "ai",
            text: data.currentQuestion,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);

        return data;
      } finally {
        setIsGlobalLoading(false);
      }
    },
    [interviewSetup, setMessages, setIsGlobalLoading],
  );

  // ── Send Message (Interview Answer) ────────────────
  const sendMessage = useCallback(
    async (text, socket = null) => {
      if (!text.trim()) return;

      const userMessage = {
        id: Date.now(),
        sender: "user",
        text,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, userMessage]);

      if (!activeSession?.sessionId) {
        // Fallback if no active session
        const aiMessage = {
          id: Date.now() + 1,
          sender: "ai",
          text: "Please start an interview session first to get AI-powered responses.",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, aiMessage]);
        return;
      }

      // If socket is provided, emit via socket
      if (socket) {
        socket.emit("transcription", {
          sessionId: activeSession.sessionId,
          transcript: text,
          isFinal: true,
        });
        return;
      }

      try {
        const data = await api.submitAnswer({
          sessionId: activeSession.sessionId,
          answer: text,
          questionIndex: activeSession.currentIndex,
        });

        // Update session state
        setActiveSession((prev) => ({
          ...prev,
          currentIndex: data.nextIndex,
          isComplete: data.isComplete,
        }));

        if (data.recovered) {
          showToast("Interview session restored", "info");
        }

        // Add evaluation feedback
        const aiMessage = {
          id: Date.now() + 1,
          sender: "ai",
          text:
            data.nextQuestion ||
            `Evaluation complete. Your score for this answer was ${data.evaluation.score}/10.`,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          evaluation: data.evaluation,
        };
        setMessages((prev) => [...prev, aiMessage]);

        if (data.isComplete) {
          // Interview is done
          showToast(
            "Interview completed! Generating final summary...",
            "success",
          );
        }

        return data;
      } catch (err) {
        showToast(err.message || "Failed to submit answer", "error");
      }
    },
    [activeSession, setMessages, showToast],
  );

  // ── Execute Code ───────────────────────────────────
  const executeCode = useCallback(
    async (codeStr, language = "python") => {
      try {
        const result = await api.executeCode({ code: codeStr, language });
        return result;
      } catch (err) {
        showToast(`Code execution failed: ${err.message}`, "error");
        return { output: "", error: err.message, exitCode: 1, success: false };
      }
    },
    [showToast],
  );

  const runCompiler = useCallback(
    async (codeStr, language, testCases) => {
      try {
        const result = await api.runCompiler({
          code: codeStr,
          language,
          testCases,
        });
        return result;
      } catch (err) {
        showToast(`Compiler run failed: ${err.message}`, "error");
        return {
          success: false,
          testResults: [],
          passedCount: 0,
          totalCount: testCases.length,
        };
      }
    },
    [showToast],
  );

  // ── End Interview Early ────────────────────────────
  const endInterview = useCallback(async () => {
    if (!activeSession?.sessionId) return null;
    setIsGlobalLoading(true);
    try {
      const data = await api.endInterview(activeSession.sessionId);
      setActiveSession(null);
      return data;
    } catch (err) {
      showToast(`Failed to end interview: ${err.message}`, "error");
      return null;
    } finally {
      setIsGlobalLoading(false);
    }
  }, [activeSession, showToast, setIsGlobalLoading]);

  // ── Save Interview (backward compat) ───────────────
  const saveInterview = useCallback(
    (interviewData) => {
      setPastInterviews((prev) => [
        { id: Date.now(), date: new Date().toISOString(), ...interviewData },
        ...prev,
      ]);
    },
    [setPastInterviews],
  );

  const value = useMemo(
    () => ({
      // Global Loading
      isGlobalLoading,
      setIsGlobalLoading,
      // Auth
      user,
      setUser,
      login,
      signup,
      loginWithGoogle,
      logout,
      // Toast
      toast,
      showToast,
      // Interview Setup
      interviewSetup,
      setInterviewSetup,
      // Resume
      uploadResume,
      // Interview
      activeSession,
      startInterview,
      endInterview,
      messages,
      sendMessage,
      pastInterviews,
      saveInterview,
      // Code
      code,
      setCode,
      executeCode,
      runCompiler,
      // Timer
      timer,
      setTimer,
    }),
    [
      user,
      toast,
      interviewSetup,
      activeSession,
      messages,
      pastInterviews,
      code,
      timer,
      login,
      signup,
      loginWithGoogle,
      logout,
      showToast,
      setInterviewSetup,
      uploadResume,
      startInterview,
      endInterview,
      sendMessage,
      saveInterview,
      setCode,
      executeCode,
      runCompiler,
      setTimer,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}
