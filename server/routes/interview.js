import mongoose from "mongoose";
import { Router } from "express";
import {
  Resume,
  InterviewSession,
  QuestionAnswer,
  FeedbackReport,
} from "../db/database.js";
import { authMiddleware } from "../middleware/auth.js";
import { asyncHandler, AppError } from "../middleware/errorHandler.js";
import {
  generateQuestions,
  evaluateAnswer,
  generateNextQuestion,
  generateInterviewSummary,
  createSession,
  saveQuestionAnswer,
  endSession,
} from "../services/interviewEngine.js";

const router = Router();

export const activeSessions = new Map();

router.post(
  "/start",
  authMiddleware,
  asyncHandler(async (req, res) => {
    try {
      const { role, persona, level, resumeId, jobDescription, questionCount } =
        req.body;

      console.log(`[Interview] Starting interview for role: ${role}`);

      if (!role) throw new AppError("Target role is required", 400);

      let resumeData = null;
      let validResumeId = null;

      if (resumeId && mongoose.Types.ObjectId.isValid(resumeId)) {
        console.log(`[Interview] Fetching resume ${resumeId}...`);
        const resume = await Resume.findOne({
          _id: resumeId,
          user_id: req.userId,
        });
        if (resume) {
          resumeData = resume.parsed_data;
          validResumeId = resumeId;
        }
      }

      console.log("[Interview] Creating session in DB...");
      const sessionId = await createSession({
        userId: req.userId,
        resumeId: validResumeId,
        role,
        persona: persona || "Senior Tech Lead",
        level: level || "Mid-Level",
        jobDescription,
      });

      console.log("[Interview] Generating questions via LLM...");
      const questions = await generateQuestions({
        role,
        level: level || "Mid-Level",
        count: Math.min(questionCount || 6, 15),
        resumeData,
        persona: persona || "Senior Tech Lead",
        jobDescription,
      });

      if (!questions || questions.length === 0) {
        throw new AppError(
          "Failed to generate questions. Please try again.",
          500,
        );
      }

      console.log(`[Interview] ${questions.length} questions generated.`);

      // DB Persistence for session recovery
      await InterviewSession.updateOne(
        { _id: sessionId },
        {
          questions,
          current_index: 0,
        },
      );

      // Cache session in memory
      activeSessions.set(sessionId, {
        userId: req.userId.toString(),
        role,
        persona: persona || "Senior Tech Lead",
        level: level || "Mid-Level",
        questions,
        currentIndex: 0,
        results: [],
        conversationHistory: [],
        resumeData,
        jobDescription,
        startedAt: Date.now(),
      });

      res.status(201).json({
        sessionId,
        totalQuestions: questions.length,
        currentQuestion: questions[0].question,
        currentIndex: 0,
      });
    } catch (error) {
      console.error("[Interview] START API ERROR:", error);
      res.status(error.statusCode || 500).json({
        error: error.message || "Internal server error during interview start",
      });
    }
  }),
);

/**
 * Common logic for processing an interview answer.
 * Used by both HTTP and Socket.io.
 */
export async function processAnswer({
  sessionId,
  userId,
  answer,
  questionIndex,
}) {
  let session = activeSessions.get(sessionId);

  // Try to recover from database if not in memory
  let recovered = false;
  if (!session) {
    const dbSession = await InterviewSession.findOne({
      _id: sessionId,
      user_id: userId,
      status: "active",
    });
    if (
      !dbSession ||
      !dbSession.questions ||
      dbSession.questions.length === 0
    ) {
      throw new AppError(
        "Interview session not found, already ended, or malformed",
        404,
      );
    }

    // Resume session from database
    const qas = await QuestionAnswer.find({ session_id: sessionId }).sort({
      question_index: 1,
    });

    const results = qas.map((qa) => ({
      question: qa.question_text,
      answer: qa.answer_text,
      score: qa.score,
      evaluation: {
        score: qa.score,
        feedback: qa.feedback,
        strengths: qa.strengths,
        improvements: qa.improvements,
      },
    }));

    const resume = await Resume.findById(dbSession.resume_id);

    session = {
      userId: dbSession.user_id.toString(),
      role: dbSession.role,
      persona: dbSession.persona,
      level: dbSession.level,
      questions: dbSession.questions,
      currentIndex: dbSession.current_index || 0,
      results,
      conversationHistory: dbSession.conversation_history || [],
      resumeData: resume ? resume.parsed_data : null,
      jobDescription: dbSession.job_description,
      startedAt: dbSession.started_at
        ? dbSession.started_at.getTime()
        : Date.now(),
    };

    activeSessions.set(sessionId, session);
    recovered = true;
    console.log(`[Interview] Session ${sessionId} recovered from MongoDB`);
  }

  if (session.userId !== userId.toString()) {
    throw new AppError("Unauthorized access to this session", 403);
  }

  const idx = questionIndex ?? session.currentIndex;
  const questionObj = session.questions[idx];
  const question =
    typeof questionObj === "string" ? questionObj : questionObj.question;
  if (!question) throw new AppError("Invalid question index");

  // Evaluate the answer
  const evaluation = await evaluateAnswer({
    question,
    answer: answer || "",
    role: session.role,
    persona: session.persona,
    level: session.level,
    resumeData: session.resumeData,
    jobDescription: session.jobDescription,
    conversationHistory: session.conversationHistory,
  });

  // Save Q&A
  await saveQuestionAnswer({
    sessionId,
    questionIndex: idx,
    question,
    answer: answer || "",
    evaluation,
  });

  // Update session state
  session.results.push({
    question,
    answer: answer || "",
    score: evaluation.score,
    evaluation,
  });

  session.conversationHistory.push(
    { sender: "ai", text: question },
    { sender: "user", text: answer || "(No answer)" },
  );

  // Update conversation history in database
  await InterviewSession.updateOne(
    { _id: sessionId },
    { conversation_history: session.conversationHistory },
  );

  // Check if interview is complete
  const nextIndex = idx + 1;
  const isComplete = nextIndex >= session.questions.length;

  if (isComplete) {
    const summary = await generateInterviewSummary({
      role: session.role,
      level: session.level,
      persona: session.persona,
      results: session.results,
    });

    await endSession({ sessionId, userId, summary });
    activeSessions.delete(sessionId);

    return {
      evaluation,
      isComplete: true,
      summary,
      recovered,
    };
  }

  // Move to next question
  session.currentIndex = nextIndex;
  await InterviewSession.updateOne(
    { _id: sessionId },
    { current_index: nextIndex },
  );

  const nextQuestionObj = session.questions[nextIndex];
  return {
    evaluation,
    isComplete: false,
    nextQuestion:
      typeof nextQuestionObj === "string"
        ? nextQuestionObj
        : nextQuestionObj.question,
    nextIndex,
    totalQuestions: session.questions.length,
    recovered,
  };
}

// ── POST /interview/answer ───────────────────────────────
router.post(
  "/answer",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { sessionId, answer, questionIndex } = req.body;
    if (!sessionId) throw new AppError("Session ID is required");

    const result = await processAnswer({
      sessionId,
      userId: req.userId,
      answer,
      questionIndex,
    });

    res.json(result);
  }),
);

// ── POST /interview/end ──────────────────────────────────
router.post(
  "/end",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { sessionId } = req.body;
    if (!sessionId) throw new AppError("Session ID is required");

    const session = activeSessions.get(sessionId);

    if (session && session.userId === req.userId.toString()) {
      // Generate summary for early end
      const summary = await generateInterviewSummary({
        role: session.role,
        level: session.level,
        persona: session.persona,
        results: session.results,
      });

      await endSession({ sessionId, userId: req.userId, summary });
      activeSessions.delete(sessionId);

      return res.json({ summary });
    }

    // Just mark as ended in DB
    await InterviewSession.updateOne(
      { _id: sessionId, user_id: req.userId },
      { status: "completed", ended_at: new Date() },
    );

    res.json({ message: "Interview ended" });
  }),
);

// ── GET /interview/result/:sessionId ─────────────────────
router.get(
  "/result/:sessionId",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const session = await InterviewSession.findOne({
      _id: req.params.sessionId,
      user_id: req.userId,
    });

    if (!session) throw new AppError("Interview not found", 404);

    const questions = await QuestionAnswer.find({
      session_id: req.params.sessionId,
    }).sort({ question_index: 1 });
    const feedback = await FeedbackReport.findOne({
      session_id: req.params.sessionId,
    });

    res.json({
      session: {
        id: session._id.toString(),
        role: session.role,
        persona: session.persona,
        level: session.level,
        status: session.status,
        overallScore: session.overall_score,
        feedbackSummary: session.feedback_summary,
        categoryScores: session.category_scores || {},
        startedAt: session.started_at,
        endedAt: session.ended_at,
      },
      questions: questions.map((q) => ({
        index: q.question_index,
        question: q.question_text,
        answer: q.answer_text,
        score: q.score,
        feedback: q.feedback,
        strengths: q.strengths || [],
        improvements: q.improvements || [],
      })),
      feedback: feedback
        ? {
            overallScore: feedback.overall_score,
            communication: feedback.communication_score,
            technical: feedback.technical_score,
            problemSolving: feedback.problem_solving_score,
            confidence: feedback.confidence_score,
            detailedFeedback: feedback.detailed_feedback,
            strengths: feedback.strengths || [],
            improvements: feedback.improvements || [],
          }
        : null,
    });
  }),
);

// ── GET /interview/history ───────────────────────────────
router.get(
  "/history",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const offset = parseInt(req.query.offset) || 0;

    const sessions = await InterviewSession.find({ user_id: req.userId })
      .select(
        "role persona level status overall_score feedback_summary started_at ended_at",
      )
      .sort({ started_at: -1 })
      .skip(offset)
      .limit(limit);

    const total = await InterviewSession.countDocuments({
      user_id: req.userId,
    });

    res.json({
      interviews: sessions.map((s) => ({
        id: s._id.toString(),
        role: s.role,
        persona: s.persona,
        level: s.level,
        status: s.status,
        score: s.overall_score,
        summary: s.feedback_summary,
        startedAt: s.started_at,
        endedAt: s.ended_at,
      })),
      total,
      limit,
      offset,
    });
  }),
);

// ── GET /interview/stats ─────────────────────────────────
router.get(
  "/stats",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.userId);

    const overallStatsAggr = await InterviewSession.aggregate([
      { $match: { user_id: userId, status: "completed" } },
      {
        $group: {
          _id: null,
          totalInterviews: { $sum: 1 },
          avgScore: { $avg: "$overall_score" },
          bestScore: { $max: "$overall_score" },
          worstScore: { $min: "$overall_score" },
        },
      },
    ]);
    const overallStats = overallStatsAggr[0] || {
      totalInterviews: 0,
      avgScore: 0,
      bestScore: 0,
      worstScore: 0,
    };

    const recentScores = await InterviewSession.find({
      user_id: userId,
      status: "completed",
      overall_score: { $ne: null },
    })
      .select("overall_score started_at role")
      .sort({ started_at: -1 })
      .limit(10);

    const categoryAvgsAggr = await FeedbackReport.aggregate([
      { $match: { user_id: userId } },
      {
        $group: {
          _id: null,
          communication: { $avg: "$communication_score" },
          technical: { $avg: "$technical_score" },
          problemSolving: { $avg: "$problem_solving_score" },
          confidence: { $avg: "$confidence_score" },
        },
      },
    ]);
    const categoryAvgs = categoryAvgsAggr[0] || {};

    res.json({
      total: overallStats.totalInterviews,
      avgScore: Math.round(overallStats.avgScore || 0),
      bestScore: overallStats.bestScore || 0,
      worstScore: overallStats.worstScore || 0,
      recentScores: recentScores.map((s) => ({
        score: s.overall_score,
        date: s.started_at,
        role: s.role,
      })),
      categoryAverages: {
        communication: Math.round(categoryAvgs.communication || 0),
        technical: Math.round(categoryAvgs.technical || 0),
        problemSolving: Math.round(categoryAvgs.problemSolving || 0),
        confidence: Math.round(categoryAvgs.confidence || 0),
      },
    });
  }),
);

export default router;
