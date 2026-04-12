import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import InterviewSetupPage from "./pages/InterviewSetupPage";
import LiveInterviewPage from "./pages/LiveInterviewPage";
import PerformancePage from "./pages/PerformancePage";
import VoiceInterviewPage from "./pages/VoiceInterviewPage";
import AppShell from "./layouts/AppShell";
import AuthLayout from "./layouts/AuthLayout";
import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "./context/AppContext";

function ProtectedRoute({ children }) {
  const { user } = useApp();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const location = useLocation();
  const { isGlobalLoading } = useApp();

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage />} />

          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<LoginPage />} />
          </Route>

          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/setup" element={<InterviewSetupPage />} />
            <Route path="/interview" element={<LiveInterviewPage />} />
            <Route path="/performance" element={<PerformancePage />} />
            <Route path="/voice-interview" element={<VoiceInterviewPage />} />
            <Route path="/settings" element={<InterviewSetupPage />} />
          </Route>
        </Routes>
      </AnimatePresence>

      {/* Global Loading Overlay */}
      <AnimatePresence>
        {isGlobalLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0B0F1A]/80 backdrop-blur-md"
          >
            <div className="relative">
              <div className="h-20 w-20 animate-spin rounded-full border-[3px] border-transparent border-t-brand-500" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-12 w-12 animate-pulse rounded-full bg-brand-500/20" />
              </div>
            </div>
            <p className="mt-6 font-display text-lg font-bold text-white tracking-tight">
              Preparing Your Experience...
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Generating AI insights and configuring session
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
