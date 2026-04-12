import { callLLM, callLLMChat, parseLLMJson } from "./llm.js";

/**
 * Build the system prompt for the AI interviewer based on configuration.
 */
function buildSystemPrompt({
  role,
  persona,
  level,
  resumeData,
  jobDescription,
}) {
  const personaInstructions = getPersonaInstructions(persona);

  let prompt = `You are a highly realistic AI voice interviewer integrated into a modern web application.

## Your Persona
${personaInstructions}

## Core Role
- Act as a professional human interviewer (not an AI).
- Ask ONE question at a time.
- Wait for the user's response before continuing.
- Adapt dynamically based on previous answers, candidate skill level, and job role context.
- Ask follow-up questions naturally and challenge vague answers politely.

## Communication Style
- Natural, conversational, and human-like.
- Use slight variations in tone: Curious ("That’s interesting, can you explain further?"), Encouraging ("Good answer, let’s go deeper."), or Neutral-professional ("Alright, here’s the next question.").
- Avoid robotic or repetitive phrasing.
- Keep sentences natural for speaking (avoid overly long or complex text).
- Add slight pauses and conversational rhythm.

## Interview Configuration
- **Target Role**: ${role}
- **Experience Level**: ${level || "Mid-Level"}
`;

  if (resumeData) {
    const parsed =
      typeof resumeData === "string" ? JSON.parse(resumeData) : resumeData;
    prompt += `
## Candidate's Resume Context
- **Name**: ${parsed.name || "Candidate"}
- **Skills**: ${(parsed.skills || []).join(", ") || "Not specified"}
- **Experience**: ${Array.isArray(parsed.experience) ? parsed.experience.join("\n") : parsed.experience || "Not provided"}
- **Education**: ${parsed.education || "Not provided"}
- **Projects**: ${Array.isArray(parsed.projects) ? parsed.projects.join("\n") : parsed.projects || "Not provided"}
- **Full Text**: ${parsed.rawText || "Not provided"}

Use this resume context to ask personalized, relevant questions that probe deeper into the candidate's actual experience.
`;
  }

  if (jobDescription) {
    prompt += `
## Target Job Description
${jobDescription.substring(0, 2000)}

Align your questions with the requirements in this job description.
`;
  }

  prompt += `
## Strict Rules
1. Ask ONE question at a time.
2. Start with a warm greeting and ask a resume-specific question first.
3. Questions should progressively increase in difficulty based on the candidate's performance.
4. Mix behavioral, technical, and situational questions.
5. After the candidate answers, briefly acknowledge/evaluate it naturally (e.g., "That's a solid explanation..."), then ask the next question.
6. NEVER mention that you are an AI, system, or model.
7. If the transcription seems unclear, say: "Sorry, I didn’t quite catch that. Could you repeat?"
8. If the answer is irrelevant, say: "Let’s refocus on the question."
9. Maintain an immersive, real-life interview experience.
`;

  return prompt;
}

/**
 * Get persona-specific instructions.
 */
function getPersonaInstructions(persona) {
  const personas = {
    "Senior Tech Lead": `You are a demanding but fair Senior Tech Lead at a top tech company.
- Focus on technical depth, system design, and coding best practices
- Ask follow-up questions that test understanding of trade-offs
- Expect concrete examples and data-driven answers
- Be direct and professional, with occasional encouraging remarks`,

    "HR Manager": `You are a warm, supportive HR Manager evaluating cultural fit and soft skills.
- Focus on behavioral questions using the STAR method
- Assess communication skills, teamwork, and leadership potential
- Ask about conflict resolution, career goals, and work ethics
- Be encouraging and create a comfortable atmosphere`,

    "Startup Founder": `You are an energetic Startup Founder looking for versatile team members.
- Focus on adaptability, product thinking, and initiative
- Ask about scrappy problem-solving and wearing multiple hats
- Test for ownership mentality and ability to handle ambiguity
- Be casual but insightful, ask unexpected creative questions`,

    "Strict FAANG Engineer": `You are a rigorous Principal Engineer at a FAANG company.
- Focus heavily on algorithms, data structures, and system design
- Expect optimal solutions with clear time/space complexity analysis
- Ask clarifying questions about edge cases and scalability
- Be precise and methodical, push for deeper technical understanding`,
  };

  return personas[persona] || personas["Senior Tech Lead"];
}

/**
 * Generate initial interview questions.
 */
export async function generateQuestions({
  role,
  level,
  count = 6,
  resumeData,
  persona,
  jobDescription,
}) {
  const systemPrompt = `You are an expert technical interviewer. 

${buildSystemPrompt({ role, persona, level, resumeData, jobDescription })}

Generate exactly ${count} interview questions for the candidate. 
Return ONLY a JSON array of objects. Schema:
[
  {
    "question": "The question text",
    "type": "behavioral" | "technical" | "coding",
    "testCases": [ // ONLY for coding type
      { "input": "input string", "expectedOutput": "output string" }
    ]
  }
]
No explanation, no markdown fences, no extra text.
Mix behavioral, technical, and coding questions. Progress from easier to harder.`;

  const userPrompt = `Generate ${count} interview questions for a ${level}-level ${role} candidate. Return as JSON array of objects with question, type, and optional testCases.`;

  try {
    const raw = await callLLM(systemPrompt, userPrompt, { temperature: 0.8 });
    try {
      const questions = parseLLMJson(raw);
      if (Array.isArray(questions)) return questions.slice(0, count);
    } catch {
      // Fallback: simple text objects
      const parsed = raw
        .split("\n")
        .map((q) => ({
          question: q
            .replace(/^\d+[\.\)]\s*/, "")
            .replace(/^["']|["']$/g, "")
            .trim(),
          type: "technical",
        }))
        .filter((q) => q.question.length > 10);

      if (parsed.length > 0) return parsed.slice(0, count);
    }
  } catch (err) {
    console.error(`[LLM Fallback] generateQuestions failed: ${err.message}`);
  }

  // Absolute fallback
  return [
    {
      question: `Can you tell me about your experience as a ${role}?`,
      type: "behavioral",
    },
    {
      question: `What are your core technical skills relevant to a ${level} level?`,
      type: "technical",
    },
    {
      question: `Describe a challenging project you worked on recently.`,
      type: "behavioral",
    },
    {
      question: `How do you handle tight deadlines and high pressure?`,
      type: "behavioral",
    },
    {
      question: `Where do you see your career heading in the next few years?`,
      type: "behavioral",
    },
    {
      question: `Why do you think you are a good fit for this role?`,
      type: "behavioral",
    },
  ].slice(0, count);
}

/**
 * Evaluate a candidate's answer to a question.
 */
export async function evaluateAnswer({
  question,
  answer,
  role,
  persona,
  level,
  resumeData,
  jobDescription,
  conversationHistory,
}) {
  if (!answer || answer.trim().length === 0) {
    return {
      score: 0,
      feedback: "No answer was provided for this question.",
      strengths: [],
      improvements: ["Provide a complete answer to demonstrate your knowledge"],
      nextDifficulty: "easier",
    };
  }

  const systemPrompt = `You are an expert interview evaluator. Evaluate the candidate's answer strictly but fairly.

${buildSystemPrompt({ role, persona, level, resumeData, jobDescription })}

Respond ONLY with a valid JSON object (no markdown, no extra text). Schema:
{
  "score": <number 0-10>,
  "feedback": "<2-3 sentence evaluation>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "nextDifficulty": "<easier|same|harder>"
}

Scoring Guide:
- 0-2: No relevant answer provided
- 3-4: Partially relevant but lacks depth  
- 5-6: Adequate answer with room for improvement
- 7-8: Good answer with solid understanding
- 9-10: Excellent, comprehensive, and insightful answer`;

  const userPrompt = `Question: ${question}
Candidate's Answer: ${answer}
Evaluate and return JSON.`;

  try {
    const raw = await callLLM(systemPrompt, userPrompt, { temperature: 0.3 });
    return parseLLMJson(raw);
  } catch (err) {
    console.error(`[LLM Fallback] evaluateAnswer failed: ${err.message}`);
    return {
      score: 50,
      feedback: "Evaluation completed. Your answer was recorded.",
      strengths: ["Attempted to answer the question"],
      improvements: [
        "Provide more specific examples",
        "Structure your answer more clearly",
      ],
      nextDifficulty: "same",
    };
  }
}

/**
 * Generate adaptive next question based on conversation context.
 */
export async function generateNextQuestion({
  role,
  persona,
  level,
  conversationHistory,
  difficulty,
  resumeData,
  jobDescription,
}) {
  const systemPrompt = buildSystemPrompt({
    role,
    persona,
    level,
    resumeData,
    jobDescription,
  });

  const chatHistory = conversationHistory.map((msg) => ({
    role: msg.sender === "ai" ? "assistant" : "user",
    content: msg.text,
  }));

  // Add instruction for next question
  chatHistory.push({
    role: "user",
    content: `Based on my previous answers, ask me the next interview question. Difficulty should be: ${difficulty}. First briefly comment on my last answer (1-2 sentences) and provide a score 1-10, then ask the next question.`,
  });

  try {
    const raw = await callLLMChat(systemPrompt, chatHistory, {
      temperature: 0.7,
    });
    if (!raw || raw.trim().length < 5) throw new Error("Empty LLM response");
    return raw;
  } catch (err) {
    console.error(`[LLM Fallback] generateNextQuestion failed: ${err.message}`);

    // Fallback: pick a random behavioral question
    const behavioralFallbacks = [
      "Can you tell me about a time you had to deal with a difficult team member?",
      "Describe a situation where you had to learn a new technology quickly.",
      "How do you handle tight deadlines and high-pressure situations?",
      "Tell me about a project you're particularly proud of and your specific role in it.",
      "What is your approach to resolving technical disagreements within a team?",
    ];
    return `Thank you for that answer. ${behavioralFallbacks[Math.floor(Math.random() * behavioralFallbacks.length)]}`;
  }
}

/**
 * Generate the complete interview summary and scoring.
 */
export async function generateInterviewSummary({
  role,
  level,
  persona,
  results,
}) {
  const systemPrompt = `You are an expert interview coach. Generate a comprehensive interview performance report.

Respond ONLY with valid JSON (no markdown, no extra text). Schema:
{
  "overallScore": <number 0-100>,
  "categoryScores": {
    "communication": <number 0-100>,
    "technicalSkills": <number 0-100>,
    "problemSolving": <number 0-100>,
    "confidence": <number 0-100>
  },
  "summary": "<3-4 sentence overall assessment>",
  "topStrengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "areasToImprove": ["<area 1>", "<area 2>", "<area 3>"],
  "actionableAdvice": "<1-2 paragraph specific advice for improvement>"
}`;

  const qa = results
    .map((r, i) => {
      return `Q${i + 1}: ${r.question}
Answer: ${r.answer || "(No answer)"}
Score: ${r.score ?? "N/A"}/100`;
    })
    .join("\n\n");

  const userPrompt = `The candidate interviewed for a ${level} ${role} position with a ${persona} interviewer.

Questions and Answers:
${qa}

Generate the comprehensive performance report as JSON.`;

  try {
    const raw = await callLLM(systemPrompt, userPrompt, {
      temperature: 0.4,
      maxTokens: 3000,
    });
    return parseLLMJson(raw);
  } catch (err) {
    console.error(
      `[LLM Fallback] generateInterviewSummary failed: ${err.message}`,
    );
    const avgScore =
      results.reduce((sum, r) => sum + (r.score || 0), 0) /
      Math.max(results.length, 1);
    return {
      overallScore: Math.round(avgScore) || 50,
      categoryScores: {
        communication: Math.round((avgScore || 50) * 0.9),
        technicalSkills: Math.round(avgScore || 50),
        problemSolving: Math.round((avgScore || 50) * 0.95),
        confidence: Math.round((avgScore || 50) * 0.85),
      },
      summary: `The candidate completed an interview for the ${role} position. Overall performance was ${avgScore >= 70 ? "solid" : "fair"}.`,
      topStrengths: [
        "Completed the full interview process",
        "Engaged with questions",
      ],
      areasToImprove: [
        "Provide more detailed, structured answers (STAR method)",
      ],
      actionableAdvice:
        "Continue practicing with mock interviews to build confidence and provide richer examples from past experience.",
    };
  }
}

import {
  InterviewSession,
  QuestionAnswer,
  FeedbackReport,
} from "../db/database.js";

/**
 * Start a new interview session.
 */
export async function createSession({
  userId,
  resumeId,
  role,
  persona,
  level,
  jobDescription,
}) {
  const session = await InterviewSession.create({
    user_id: userId,
    resume_id: resumeId || null,
    role,
    persona: persona || "Senior Tech Lead",
    level: level || "Mid-Level",
    job_description: jobDescription || null,
    status: "active",
  });

  return session._id.toString();
}

/**
 * Save a question-answer pair.
 */
export async function saveQuestionAnswer({
  sessionId,
  questionIndex,
  question,
  answer,
  evaluation,
}) {
  const qa = await QuestionAnswer.create({
    session_id: sessionId,
    question_index: questionIndex,
    question_text: question,
    answer_text: answer || "",
    score: evaluation?.score ?? 0,
    feedback: evaluation?.feedback || "",
    strengths: evaluation?.strengths || [],
    improvements: evaluation?.improvements || [],
    difficulty: evaluation?.nextDifficulty || "medium",
  });

  return qa._id.toString();
}

/**
 * End an interview session with final scores.
 */
export async function endSession({ sessionId, userId, summary }) {
  // Update session
  await InterviewSession.updateOne(
    { _id: sessionId },
    {
      status: "completed",
      overall_score: summary.overallScore,
      feedback_summary: summary.summary,
      category_scores: summary.categoryScores,
      ended_at: new Date(),
    },
  );

  // Create feedback report
  const report = await FeedbackReport.create({
    session_id: sessionId,
    user_id: userId,
    overall_score: summary.overallScore,
    communication_score: summary.categoryScores?.communication ?? 0,
    technical_score: summary.categoryScores?.technicalSkills ?? 0,
    problem_solving_score: summary.categoryScores?.problemSolving ?? 0,
    confidence_score: summary.categoryScores?.confidence ?? 0,
    detailed_feedback: summary.actionableAdvice || summary.summary,
    strengths: summary.topStrengths || [],
    improvements: summary.areasToImprove || [],
  });

  return report._id.toString();
}
