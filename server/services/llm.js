import { GoogleGenerativeAI } from '@google/generative-ai'

let genAI = null
let model = null

function getModel() {
  if (!model) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not set. Get one at https://aistudio.google.com/apikey')
    }
    genAI = new GoogleGenerativeAI(apiKey)
    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
  }
  return model
}

/**
 * Call Gemini with a system prompt and user prompt.
 * Handles retries on transient failures and timeouts.
 */
export async function callLLM(systemPrompt, userPrompt, options = {}) {
  const { maxRetries = 2, temperature = 0.7, timeout = 30000 } = options;
  const m = getModel();

  let lastError = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const generatePromise = m.generateContent({
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        systemInstruction: { role: "system", parts: [{ text: systemPrompt }] },
        generationConfig: {
          temperature,
          maxOutputTokens: options.maxTokens || 2048,
        },
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(`LLM request timed out after ${timeout}ms`)),
          timeout,
        ),
      );

      const result = await Promise.race([generatePromise, timeoutPromise]);
      const response = result.response;
      return response.text();
    } catch (err) {
      lastError = err;
      console.error(`[LLM] Attempt ${attempt + 1} failed:`, err.message);
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }
  throw new Error(
    `LLM call failed after ${maxRetries + 1} attempts: ${lastError?.message}`,
  );
}

/**
 * Call Gemini with full conversation history for multi-turn chat.
 */
export async function callLLMChat(systemPrompt, conversationHistory, options = {}) {
  const { temperature = 0.7, maxRetries = 2 } = options
  const m = getModel()

  let lastError = null
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const chat = m.startChat({
        history: conversationHistory.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : msg.role,
          parts: [{ text: msg.content }],
        })),
        systemInstruction: { role: 'system', parts: [{ text: systemPrompt }] },
        generationConfig: {
          temperature,
          maxOutputTokens: options.maxTokens || 2048,
        },
      })

      // The last message in history should be the user message
      // But since we pass it in history, we send a continuation prompt
      const lastMsg = conversationHistory[conversationHistory.length - 1]
      if (lastMsg && lastMsg.role === 'user') {
        // Remove last message from history, send it as the prompt
        const historyWithout = conversationHistory.slice(0, -1)
        const chatRetry = m.startChat({
          history: historyWithout.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : msg.role,
            parts: [{ text: msg.content }],
          })),
          systemInstruction: { role: 'system', parts: [{ text: systemPrompt }] },
          generationConfig: { temperature, maxOutputTokens: options.maxTokens || 2048 },
        })
        const result = await chatRetry.sendMessage(lastMsg.content)
        return result.response.text()
      }

      // Fallback: just get response
      const result = await chat.sendMessage('Continue the conversation.')
      return result.response.text()
    } catch (err) {
      lastError = err
      console.error(`[LLM Chat] Attempt ${attempt + 1} failed:`, err.message)
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)))
      }
    }
  }
  throw new Error(`LLM chat failed after ${maxRetries + 1} attempts: ${lastError?.message}`)
}

/**
 * Parse JSON from LLM response, handling markdown code blocks.
 */
export function parseLLMJson(raw) {
  const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  return JSON.parse(cleaned)
}
