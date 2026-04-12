import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  PlayCircle,
  TrendingUp,
  Award,
  BrainCircuit,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  ArrowRight,
  Inbox,
} from "lucide-react";
import Card, { StatCard } from "../components/Card";
import Button from "../components/Button";
import PageTransition from "../components/PageTransition";
import { useApp } from "../context/AppContext";
import api from "../services/api";

function EmptyState({ icon: Icon, title, description, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.08]">
        <Icon className="h-6 w-6 text-slate-500" />
      </div>
      <h4 className="mb-2 text-lg font-medium text-slate-300">{title}</h4>
      <p className="mb-6 max-w-sm text-sm">{description}</p>
      {action && (
        <Button variant="outline" size="sm" onClick={action}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

function RecordingCard({ item }) {
  const dateStr = new Date(item.startedAt || item.date).toLocaleDateString();
  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-3 transition-all hover:bg-white/[0.04] overflow-hidden relative">
      <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-brand-500/10 border border-brand-500/20 grid place-items-center">
        <PlayCircle className="h-6 w-6 text-brand-400 shadow-glow-sm opacity-90 group-hover:scale-110 group-hover:opacity-100 transition-all" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="truncate font-semibold text-white">{item.role}</h4>
        <p className="truncate text-sm text-slate-400">
          Score: {item.score ?? item.avgScore ?? "--"}/100
        </p>
        <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
          <Clock className="h-3 w-3" /> {dateStr}
        </p>
      </div>
      <div
        className={`px-2 py-1 rounded-lg text-xs font-medium ${
          (item.score || item.avgScore || 0) >= 70
            ? "bg-emerald-500/10 text-emerald-400"
            : "bg-amber-500/10 text-amber-400"
        }`}
      >
        {(item.score || item.avgScore || 0) >= 70 ? "Strong" : "Review"}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, pastInterviews } = useApp();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Load real stats from backend
    api
      .getInterviewStats()
      .then(setStats)
      .catch(() => {});
    api
      .getInterviewHistory(5, 0)
      .then((data) => setHistory(data.interviews || []))
      .catch(() => {});
  }, []);

  const totalInterviews = stats?.total ?? pastInterviews.length;
  const recentScore = stats?.avgScore ?? (pastInterviews[0]?.avgScore || 0);
  const bestScore = stats?.bestScore ?? 0;
  const displayHistory = history.length > 0 ? history : pastInterviews;

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl space-y-8">
        {/* ── Welcome Banner ── */}
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-panel p-8 sm:p-10 card">
          <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
          <div className="absolute top-0 right-0 p-10 opacity-20 pointer-events-none">
            <BrainCircuit className="h-40 w-40 text-brand-500 blur-sm" />
          </div>

          <div className="relative z-10 max-w-2xl">
            <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Welcome back, {user?.name?.split(" ")[0] || "User"}
            </h1>
            <p className="mt-2 text-brand-400 font-medium tracking-wide uppercase text-xs">
              Target Role: {user?.targetRole || "Software Engineer"}
            </p>
            <p className="mt-4 text-slate-400 text-lg leading-relaxed">
              {totalInterviews === 0
                ? "You haven't completed any interviews yet. Start your first session to unlock personalized AI feedback and analytics."
                : `You've completed ${totalInterviews} interview${totalInterviews > 1 ? "s" : ""} with an average score of ${recentScore}%. ${recentScore >= 70 ? "Keep it up!" : "Review the feedback to improve."}`}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button onClick={() => navigate("/setup")} icon={BrainCircuit}>
                Start Interview
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate("/voice-interview")}
                icon={PlayCircle}
              >
                Voice Practice
              </Button>
            </div>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Average Score"
            value={totalInterviews > 0 ? `${recentScore}%` : "--"}
            icon={TrendingUp}
            color="emerald"
          />
          <StatCard
            label="Interviews Completed"
            value={totalInterviews}
            icon={CheckCircle2}
            color="brand"
          />
          <StatCard
            label="Best Score"
            value={bestScore > 0 ? `${bestScore}%` : "N/A"}
            icon={Award}
            color="purple"
          />
          <StatCard
            label="Target Score"
            value={`${user?.targetScore || 85}%`}
            icon={Calendar}
            color="cyan"
          />
        </div>

        {/* ── Main Content Grid ── */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Quick Start */}
          <Card hover={false} className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-semibold text-white">
                Quick Start
              </h3>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/setup")}
                className="w-full flex items-center gap-4 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 transition-all hover:bg-white/[0.04] text-left"
              >
                <div className="h-12 w-12 rounded-xl bg-brand-500/10 border border-brand-500/20 grid place-items-center">
                  <BrainCircuit className="h-5 w-5 text-brand-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">Text Interview</h4>
                  <p className="text-sm text-slate-400">
                    Chat-based with code editor
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-500" />
              </button>
              <button
                onClick={() => navigate("/voice-interview")}
                className="w-full flex items-center gap-4 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 transition-all hover:bg-white/[0.04] text-left"
              >
                <div className="h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 grid place-items-center">
                  <PlayCircle className="h-5 w-5 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">Voice Interview</h4>
                  <p className="text-sm text-slate-400">
                    Speak naturally, get AI feedback
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-500" />
              </button>
            </div>
          </Card>

          {/* Past Recordings */}
          <Card hover={false} className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-semibold text-white">
                Recent Interviews
              </h3>
            </div>

            {displayHistory.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No interviews yet"
                description="Complete an interview session to see your history and scores here."
              />
            ) : (
              <div className="space-y-3">
                {displayHistory.slice(0, 4).map((item) => (
                  <RecordingCard key={item.id} item={item} />
                ))}
              </div>
            )}

            {displayHistory.length > 0 && (
              <Button
                variant="ghost"
                className="w-full mt-4"
                iconRight={ArrowRight}
                onClick={() => navigate("/performance")}
              >
                View All Analytics
              </Button>
            )}
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
