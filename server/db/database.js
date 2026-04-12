import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ai-interview";

export async function initDb() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB at", MONGODB_URI);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}

// ─── Models ─────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    password_hash: { type: String },
    avatar_url: { type: String },
    auth_provider: { type: String, default: "email" },
    target_role: { type: String, default: "Software Engineer" },
    target_score: { type: Number, default: 85 },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);

const resumeSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    filename: { type: String, required: true },
    original_text: { type: String },
    parsed_data: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: { createdAt: "uploaded_at", updatedAt: false } },
);

export const Resume = mongoose.model("Resume", resumeSchema);

const interviewSessionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  resume_id: { type: mongoose.Schema.Types.ObjectId, ref: "Resume" },
  role: { type: String, required: true },
  persona: { type: String, default: "Senior Tech Lead" },
  level: { type: String, default: "Mid-Level" },
  job_description: { type: String },
  status: { type: String, default: "active" },
  questions: { type: mongoose.Schema.Types.Mixed, default: [] },
  current_index: { type: Number, default: 0 },
  overall_score: { type: Number },
  feedback_summary: { type: String },
  category_scores: { type: mongoose.Schema.Types.Mixed },
  started_at: { type: Date, default: Date.now },
  ended_at: { type: Date },
  conversation_history: { type: Array, default: [] },
});

export const InterviewSession = mongoose.model(
  "InterviewSession",
  interviewSessionSchema,
);

const qaSchema = new mongoose.Schema(
  {
    session_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewSession",
      required: true,
    },
    question_index: { type: Number, required: true },
    question_text: { type: String, required: true },
    answer_text: { type: String },
    score: { type: Number },
    feedback: { type: String },
    strengths: { type: [String], default: [] },
    improvements: { type: [String], default: [] },
    difficulty: { type: String, default: "medium" },
  },
  { timestamps: { createdAt: "answered_at", updatedAt: false } },
);

export const QuestionAnswer = mongoose.model("QuestionAnswer", qaSchema);

const feedbackReportSchema = new mongoose.Schema(
  {
    session_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewSession",
      required: true,
      unique: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    overall_score: { type: Number, required: true },
    communication_score: { type: Number },
    technical_score: { type: Number },
    problem_solving_score: { type: Number },
    confidence_score: { type: Number },
    detailed_feedback: { type: String },
    strengths: { type: [String], default: [] },
    improvements: { type: [String], default: [] },
  },
  { timestamps: true },
);

export const FeedbackReport = mongoose.model(
  "FeedbackReport",
  feedbackReportSchema,
);
