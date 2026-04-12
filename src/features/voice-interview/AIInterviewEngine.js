/**
 * AI Interview Engine — Routes all LLM calls through the backend server.
 * No more direct API calls from the browser.
 */
import api from '../../services/api'

/**
 * Generate interview questions via backend.
 */
export async function generateInterviewQuestions({ role, level, count = 6 }) {
  const data = await api.startInterview({
    role,
    level,
    questionCount: count,
    persona: 'Senior Tech Lead',
  })

  // Store session ID for later use
  window.__voiceInterviewSession = {
    sessionId: data.sessionId,
    totalQuestions: data.totalQuestions,
    currentIndex: 0,
  }

  // The backend returns the first question — we need all questions
  // For voice mode, we make an initial session and extract the first question
  // Then subsequent questions come from the answer endpoint
  
  // Return the first question directly; subsequent ones come from evaluateAnswer
  return [data.currentQuestion]
}

/**
 * Evaluate a candidate's answer.
 */
export async function evaluateAnswer({ question, answer, role }) {
  const session = window.__voiceInterviewSession
  if (!session?.sessionId) {
    throw new Error('No active interview session')
  }

  const data = await api.submitAnswer({
    sessionId: session.sessionId,
    answer: answer || '(No answer provided)',
    questionIndex: session.currentIndex,
  })

  session.currentIndex = data.nextIndex ?? (session.currentIndex + 1)

  // Attach next question if available
  const result = {
    score: data.evaluation?.score ?? 0,
    feedback: data.evaluation?.feedback ?? 'Evaluation completed.',
    strengths: data.evaluation?.strengths ?? [],
    improvements: data.evaluation?.improvements ?? [],
  }

  // If not complete, store the next question
  if (!data.isComplete && data.nextQuestion) {
    window.__voiceNextQuestion = data.nextQuestion
  }

  // If complete, store summary
  if (data.isComplete && data.summary) {
    window.__voiceInterviewSummary = data.summary
  }

  return result
}

/**
 * Get the next question (generated from the answer endpoint).
 */
export function getNextQuestion() {
  const q = window.__voiceNextQuestion
  window.__voiceNextQuestion = null
  return q
}

/**
 * Generate interview summary.
 */
export async function generateInterviewSummary({ role, level, results }) {
  // Check if we already have a summary from the last answer
  if (window.__voiceInterviewSummary) {
    const summary = window.__voiceInterviewSummary
    window.__voiceInterviewSummary = null
    return summary.summary || summary.actionableAdvice || 'Interview complete. Great effort!'
  }

  // Fallback: end the session
  const session = window.__voiceInterviewSession
  if (session?.sessionId) {
    try {
      const data = await api.endInterview(session.sessionId)
      window.__voiceInterviewSession = null
      return data.summary?.summary || 'Interview complete. Review your results on the Performance page.'
    } catch {
      return 'Interview complete. Great effort!'
    }
  }

  return 'Interview complete. Great effort!'
}