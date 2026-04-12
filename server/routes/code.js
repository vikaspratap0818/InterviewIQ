import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { asyncHandler, AppError } from '../middleware/errorHandler.js'
import { executeCode, getAvailableRuntimes } from '../services/codeExecutor.js'

const router = Router()

// ── POST /code/execute (Standard) ────────────────────────
router.post('/execute', authMiddleware, asyncHandler(async (req, res) => {
  const { code, language, stdin } = req.body
  
  if (!code || !code.trim()) throw new AppError('Code is required')
  if (!language) throw new AppError('Language is required')

  const result = await executeCode(code, language, stdin || '')
  res.json({
    output: result.output,
    error: result.error,
    exitCode: result.exitCode,
    status: result.status,
    success: result.exitCode === 0 && !result.error,
  })
}))

// ── POST /code/run (LeetCode Style) ──────────────────────
router.post('/run', authMiddleware, asyncHandler(async (req, res) => {
  const { code, language, testCases } = req.body

  if (!code || !code.trim()) throw new AppError('Code is required')
  if (!language) throw new AppError('Language is required')
  if (!testCases || !Array.isArray(testCases)) throw new AppError('Test cases are required as an array')

  console.log(`[Compiler] Running ${language} with ${testCases.length} test cases`)

  const results = []
  let passedCount = 0

  for (const tc of testCases) {
    const result = await executeCode(code, language, tc.input || '', tc.expectedOutput || null)
    
    const passed = result.passed || (result.output.trim() === (tc.expectedOutput || '').trim())

    results.push({
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      actualOutput: result.output,
      passed,
      error: result.error,
      time: result.time,
      memory: result.memory,
      status: result.status
    })

    if (passed) passedCount++
  }

  res.json({
    success: passedCount === testCases.length,
    passedCount,
    totalCount: testCases.length,
    testResults: results
  })
}))

// ── GET /code/runtimes ───────────────────────────────────
router.get('/runtimes', asyncHandler(async (req, res) => {
  const runtimes = await getAvailableRuntimes()
  res.json(runtimes)
}))

export default router
