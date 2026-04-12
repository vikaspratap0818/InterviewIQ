import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Download,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  RefreshCw,
  Clock,
  ChevronRight,
  MessageSquare,
  Code2,
  User,
} from "lucide-react";
import PageTransition from "../components/PageTransition";
import Card from "../components/Card";
import Button from "../components/Button";
import StatRing from "../components/StatRing";
import TrendLineChart from "../components/TrendLineChart";
import AnalysisRadarChart from "../components/AnalysisRadarChart";
import api from "../services/api";

export default function PerformancePage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [sessionResult, setSessionResult] = useState(null);
  const [loadingResult, setLoadingResult] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, historyData] = await Promise.all([
        api.getInterviewStats(),
        api.getInterviewHistory(20, 0),
      ]);

      setStats(statsData);
      const interviews = historyData.interviews || [];
      setHistory(interviews);

      // Only select if nothing is currently selected
      if (interviews.length > 0 && !selectedSessionId) {
        handleSelectSession(interviews[0].id);
      }
    } catch (err) {
      console.error("Failed to load performance data:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedSessionId]); // We need selectedSessionId to know if we should auto-select

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectSession = async (id) => {
    if (selectedSessionId === id && sessionResult) return;
    setSelectedSessionId(id);
    setLoadingResult(true);
    try {
      const result = await api.getInterviewResult(id);
      setSessionResult(result);
    } catch (err) {
      console.error("Failed to load session result:", err);
      showToast?.(err.message || "Failed to load interview details", "error");
    } finally {
      setLoadingResult(false);
    }
  };

  const trendData = (stats?.recentScores || []).reverse().map((s, i) => ({
    session: `Session ${i + 1}`,
    score: s.score || 0,
  }));

  const catScores =
    sessionResult?.session?.categoryScores || stats?.categoryAverages || {};
  const feedback = sessionResult?.feedback || sessionResult?.session;

  const radarData = [
    {
      subject: "Technical",
      A: catScores.technicalSkills || catScores.technical || 0,
      fullMark: 100,
    },
    {
      subject: "Communication",
      A: catScores.communication || 0,
      fullMark: 100,
    },
    {
      subject: "Problem Solving",
      A: catScores.problemSolving || 0,
      fullMark: 100,
    },
    { subject: "Confidence", A: catScores.confidence || 0, fullMark: 100 },
  ];

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl space-y-8">
        {/* ── Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">
              Performance Analytics
            </h1>
            <p className="mt-1 text-slate-400">
              {stats?.total > 0
                ? `Review your ${stats.total} past interview${stats.total > 1 ? "s" : ""} and track your progress.`
                : "Complete an interview to see your performance analytics."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              icon={RefreshCw}
              onClick={loadData}
              loading={loading}
            >
              Refresh
            </Button>
            <Button icon={Plus} onClick={() => navigate("/setup")}>
              New Interview
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-transparent border-t-brand-400" />
            <p className="text-slate-400">Loading your analytics...</p>
          </div>
        ) : stats?.total === 0 ? (
          <Card hover={false} className="p-12 text-center">
            <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-brand-500/10 border border-brand-500/20 grid place-items-center">
              <BarChart3 className="h-10 w-10 text-brand-400" />
            </div>
            <h2 className="font-display text-xl font-bold text-white mb-2">
              No Data Yet
            </h2>
            <p className="text-slate-400 max-w-md mx-auto mb-6">
              Complete your first AI interview to unlock personalized
              performance analytics, progress tracking, and actionable
              improvement insights.
            </p>
            <Button onClick={() => navigate("/setup")} icon={Plus}>
              Start Your First Interview
            </Button>
          </Card>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
            {/* ── Sidebar: Session History ── */}
            <div className="space-y-4 order-2 lg:order-1">
              <h2 className="font-display text-lg font-semibold text-white flex items-center gap-2 px-1">
                <Clock className="h-5 w-5 text-slate-400" />
                Interview History
              </h2>
              <div className="space-y-2 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectSession(item.id)}
                    className={`w-full text-left rounded-2xl border p-4 transition-all ${
                      selectedSessionId === item.id
                        ? "bg-brand-500/10 border-brand-500/40 shadow-glow-sm"
                        : "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.1]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {new Date(item.startedAt).toLocaleDateString()}
                      </span>
                      <div
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          (item.score || 0) >= 80
                            ? "bg-emerald-500/10 text-emerald-400"
                            : (item.score || 0) >= 60
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        {item.score || 0}%
                      </div>
                    </div>
                    <h4 className="font-semibold text-white truncate">
                      {item.role}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 truncate">
                      {item.persona}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Main Content: Detailed Analysis ── */}
            <div className="space-y-8 min-w-0">
              {loadingResult ? (
                <div className="flex h-[400px] items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-transparent border-t-brand-400" />
                </div>
              ) : sessionResult ? (
                <>
                  {/* Stats Overview */}
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <StatRing
                      value={
                        catScores.technicalSkills || catScores.technical || 0
                      }
                      label="Technical"
                      color="emerald"
                    />
                    <StatRing
                      value={catScores.communication || 0}
                      label="Communication"
                      color="brand"
                    />
                    <StatRing
                      value={catScores.problemSolving || 0}
                      label="Problem Solving"
                      color="brand"
                    />
                    <StatRing
                      value={catScores.confidence || 0}
                      label="Confidence"
                      color="amber"
                    />
                  </div>

                  {/* AI Feedback Summary */}
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card
                      hover={false}
                      className="p-6 relative overflow-hidden flex flex-col items-center justify-center"
                    >
                      <h3 className="font-display text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
                        Competency Map
                      </h3>
                      <AnalysisRadarChart data={radarData} />
                    </Card>

                    <Card
                      hover={false}
                      className="p-6 relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
                      <h3 className="font-display text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        Key Strengths
                      </h3>
                      <ul className="space-y-3">
                        {(feedback?.strengths?.length > 0
                          ? feedback.strengths
                          : [
                              "Keep practicing to identify your key technical strengths.",
                            ]
                        ).map((item, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2.5 text-sm text-slate-300"
                          >
                            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </Card>

                    <Card
                      hover={false}
                      className="p-6 relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-rose-500" />
                      <h3 className="font-display text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-rose-400" />
                        Areas to Improve
                      </h3>
                      <ul className="space-y-3">
                        {(feedback?.improvements?.length > 0
                          ? feedback.improvements
                          : ["Consistency is key. Focus on technical clarity."]
                        ).map((item, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2.5 text-sm text-slate-300"
                          >
                            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-rose-400 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </div>

                  {/* Detailed AI Recommendation */}
                  <Card
                    hover={false}
                    className="p-6 border-brand-500/20 bg-brand-500/[0.02]"
                  >
                    <h3 className="font-display text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-brand-400" />
                      AI Performance Review
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed bg-white/[0.03] p-4 rounded-2xl border border-white/5 whitespace-pre-wrap">
                      {feedback?.detailedFeedback ||
                        sessionResult.session?.feedbackSummary ||
                        "Detailed analysis is being generated..."}
                    </p>
                  </Card>

                  {/* Question Breakdown */}
                  <div className="space-y-4">
                    <h3 className="font-display text-lg font-semibold text-white flex items-center gap-2 px-1">
                      <MessageSquare className="h-5 w-5 text-slate-400" />
                      Question Breakdown
                    </h3>
                    <div className="space-y-4">
                      {sessionResult.questions?.map((q, i) => (
                        <div
                          key={i}
                          className="rounded-2xl border border-white/[0.05] bg-white/[0.01] p-5 space-y-4 transition-all hover:bg-white/[0.02]"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                Question {i + 1}
                              </span>
                              <h4 className="text-white font-medium">
                                {q.question}
                              </h4>
                            </div>
                            <div
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                (q.score || 0) >= 8
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : (q.score || 0) >= 5
                                    ? "bg-amber-500/10 text-amber-400"
                                    : "bg-rose-500/10 text-rose-400"
                              }`}
                            >
                              {q.score || 0}/10
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                <User className="h-3 w-3" /> Your Answer
                              </div>
                              <p className="text-xs text-slate-400 leading-relaxed bg-black/20 p-3 rounded-xl min-h-[60px]">
                                {q.answer || "No answer provided"}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                <Sparkles className="h-3 w-3 text-brand-400" />{" "}
                                AI Feedback
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed bg-brand-500/[0.03] p-3 rounded-xl min-h-[60px]">
                                {q.feedback}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex h-[400px] items-center justify-center text-slate-500">
                  Select an interview from the history to view analysis
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
