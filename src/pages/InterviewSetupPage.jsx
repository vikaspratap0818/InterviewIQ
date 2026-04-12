import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Code2,
  Briefcase,
  Rocket,
  UploadCloud,
  FileText,
  X,
  Target,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Shield,
  Layers,
} from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";
import PageTransition from "../components/PageTransition";
import { useApp } from "../context/AppContext";

const personas = [
  {
    title: "Senior Tech Lead",
    description:
      "System design, advanced algorithms, and technical architecture.",
    icon: Code2,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
  {
    title: "HR Manager",
    description:
      "Cultural fit, behavioral questions, and leadership principles.",
    icon: Briefcase,
    color: "text-brand-400",
    bg: "bg-brand-500/10",
    border: "border-brand-500/20",
  },
  {
    title: "Startup Founder",
    description:
      "Product sense, adaptability, and high-impact decision making.",
    icon: Rocket,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  {
    title: "Strict FAANG Engineer",
    description:
      "Deep algorithmic skills, system design, and optimal solutions.",
    icon: Shield,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
];

const ROLES = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "Product Manager",
  "DevOps Engineer",
  "ML Engineer",
];
const LEVELS = ["Intern", "Junior", "Mid-Level", "Senior", "Lead", "Principal"];

export default function InterviewSetupPage() {
  const {
    interviewSetup,
    setInterviewSetup,
    uploadResume,
    startInterview,
    showToast,
  } = useApp();
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
    else if (e.type === "dragleave") setIsDragging(false);
  }, []);

  const handleFileUpload = useCallback(
    async (file) => {
      if (!file) return;
      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];
      const validExts = [".pdf", ".docx", ".txt"];
      const ext = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];

      if (!validTypes.includes(file.type) && !validExts.includes(ext)) {
        showToast(
          "Unsupported format. Please upload a PDF, DOCX, or TXT file.",
          "error",
        );
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        showToast("File too large. Maximum size is 10MB.", "error");
        return;
      }

      setUploading(true);
      try {
        const data = await uploadResume(file);
        if (data.skills?.length > 0) {
          showToast(
            `Extracted ${data.skills.length} skills from your resume!`,
            "success",
          );
        } else {
          showToast("Resume uploaded successfully!", "success");
        }
      } catch (err) {
        console.error("Upload error:", err);
        const errorMsg =
          err.data?.error || err.message || "Failed to upload and parse resume";
        showToast(errorMsg, "error");
      } finally {
        setUploading(false);
      }
    },
    [uploadResume, showToast],
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files?.[0]) {
        handleFileUpload(e.dataTransfer.files[0]);
      }
    },
    [handleFileUpload],
  );

  const handleFileInputChange = useCallback(
    (e) => {
      if (e.target.files?.[0]) {
        handleFileUpload(e.target.files[0]);
      }
    },
    [handleFileUpload],
  );

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await startInterview({
        role: interviewSetup.role || "Software Engineer",
        persona: interviewSetup.persona || "Senior Tech Lead",
        level: interviewSetup.level || "Mid-Level",
      });
      navigate("/interview");
    } catch (err) {
      showToast(err.message || "Failed to start interview", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-brand-500/10 rounded-2xl border border-brand-500/20 mb-4 shadow-glow-sm">
            <Target className="h-6 w-6 text-brand-400" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Interview Context
          </h1>
          <p className="mt-3 text-slate-400 text-lg max-w-2xl mx-auto">
            Give the AI context about your experience and the role you are
            applying for to generate a highly personalized interview.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Resume Upload */}
          <Card hover={false} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-white">
                Your Resume
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                PDF, DOCX, or TXT (Max 10MB)
              </span>
            </div>

            {!interviewSetup.resumeName ? (
              <div
                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer
                  ${isDragging ? "border-brand-400 bg-brand-500/5" : "border-white/10 bg-white/[0.02] hover:border-brand-500/30 hover:bg-white/[0.04]"}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
                <div className="rounded-full bg-white/5 p-4 mb-4">
                  {uploading ? (
                    <svg
                      className="h-8 w-8 animate-spin text-brand-400"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                  ) : (
                    <UploadCloud
                      className={`h-8 w-8 ${isDragging ? "text-brand-400" : "text-slate-400"}`}
                    />
                  )}
                </div>
                <h3 className="text-base font-medium text-white mb-1">
                  {uploading
                    ? "Analyzing your resume..."
                    : "Drag and drop your resume"}
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  Or click to browse files
                </p>
                {!uploading && (
                  <Button variant="secondary" size="sm">
                    Browse Files
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 shadow-[0_0_20px_rgba(16,185,129,0.05)]">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-emerald-500/20 p-3">
                      <FileText className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-medium text-emerald-100">
                        {interviewSetup.resumeName}
                      </p>
                      <p className="text-xs text-emerald-400/70 mt-0.5">
                        {interviewSetup.resumeParsed?.skills?.length
                          ? `${interviewSetup.resumeParsed.skills.length} skills extracted`
                          : "Parsed successfully"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setInterviewSetup((p) => ({
                        ...p,
                        resumeName: null,
                        resumeId: null,
                        resumeParsed: null,
                      }))
                    }
                    className="rounded-lg p-2 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Show extracted skills */}
                {interviewSetup.resumeParsed?.skills?.length > 0 && (
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
                      Extracted Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {interviewSetup.resumeParsed.skills
                        .slice(0, 15)
                        .map((skill, i) => (
                          <span
                            key={i}
                            className="rounded-lg bg-brand-500/10 px-2.5 py-1 text-xs font-medium text-brand-300 border border-brand-500/20"
                          >
                            {skill}
                          </span>
                        ))}
                      {interviewSetup.resumeParsed.skills.length > 15 && (
                        <span className="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-slate-500">
                          +{interviewSetup.resumeParsed.skills.length - 15} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Job Description */}
          <Card hover={false} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-white">
                Job Description
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                Optional
              </span>
            </div>
            <textarea
              value={interviewSetup.jobDescription}
              onChange={(e) =>
                setInterviewSetup((p) => ({
                  ...p,
                  jobDescription: e.target.value,
                }))
              }
              placeholder="Paste the target job description here to tailor the questions to specific requirements..."
              className="w-full h-[200px] resize-none rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white placeholder-slate-500 transition-colors focus:border-brand-500/50 focus:bg-white/[0.06] focus:outline-none focus:ring-1 focus:ring-brand-500/50"
            />
          </Card>
        </div>

        {/* Target Role */}
        <div className="mb-6">
          <h2 className="font-display text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-brand-400" />
            Target Role
          </h2>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((r) => (
              <button
                key={r}
                onClick={() => setInterviewSetup((p) => ({ ...p, role: r }))}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${interviewSetup.role === r ? "bg-brand-500 text-white shadow-glow-sm" : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5"}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Experience Level */}
        <div className="mb-8">
          <h2 className="font-display text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <Layers className="h-5 w-5 text-brand-400" />
            Experience Level
          </h2>
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((l) => (
              <button
                key={l}
                onClick={() => setInterviewSetup((p) => ({ ...p, level: l }))}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${interviewSetup.level === l ? "bg-brand-500 text-white shadow-glow-sm" : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5"}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Persona Selection */}
        <div className="mb-10 text-center">
          <h2 className="font-display text-xl font-bold text-white mb-2">
            Select Interviewer Persona
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Choose the style and focus of your AI interviewer.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {personas.map((role) => {
              const active = interviewSetup.persona === role.title;
              const Icon = role.icon;
              return (
                <button
                  key={role.title}
                  onClick={() =>
                    setInterviewSetup((p) => ({ ...p, persona: role.title }))
                  }
                  className={`
                    group relative flex flex-col items-center rounded-2xl border p-6 text-center transition-all duration-200
                    ${
                      active
                        ? `border-brand-500 bg-brand-500/10 shadow-[0_0_30px_rgba(99,102,241,0.15)]`
                        : `border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]`
                    }
                  `}
                >
                  <div
                    className={`mb-4 rounded-xl p-3 transition-colors ${active ? role.bg : "bg-white/5 group-hover:bg-white/10"} border ${active ? role.border : "border-transparent"}`}
                  >
                    <Icon
                      className={`h-6 w-6 ${active ? role.color : "text-slate-400 group-hover:text-white transition-colors"}`}
                    />
                  </div>
                  <h3
                    className={`font-semibold mb-2 ${active ? "text-white" : "text-slate-300"}`}
                  >
                    {role.title}
                  </h3>
                  <p
                    className={`text-xs leading-relaxed ${active ? "text-brand-100/80" : "text-slate-500"}`}
                  >
                    {role.description}
                  </p>

                  {active && (
                    <div className="absolute top-3 right-3 rounded-full bg-brand-500 p-1">
                      <CheckCircle2 className="h-3 w-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Start Action */}
        <div className="flex flex-col items-center py-6 border-t border-white/[0.06]">
          <Button
            className="w-full py-6 text-lg"
            onClick={handleGenerate}
            loading={loading}
            disabled={loading}
            icon={Sparkles}
          >
            {loading ? "Generating Your Interview..." : "Generate AI Interview"}
          </Button>
          <p className="mt-4 text-xs text-slate-500 flex items-center gap-1">
            AI-generated questions based on your resume and role selection
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
