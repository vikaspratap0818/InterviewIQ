export function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message)
  if (process.env.NODE_ENV === 'development') console.error(err.stack)

  // Handle known error types
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' })
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large. Maximum size is 10MB.' })
  }

  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE' || err.code === 11000) {
    return res.status(409).json({ error: 'A record with this information already exists' })
  }

  // Handle MongoDB CastError (invalid ObjectId, e.g., old SQLite UUIDs)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    if (err.path === '_id' || err.path === 'user_id' || req.originalUrl.startsWith('/api/auth/me')) {
      return res.status(401).json({ error: 'Invalid or expired session pointer. Please log in again.' })
    }
    return res.status(400).json({ error: `Invalid ID format for ${err.path}` })
  }

  const statusCode = err.statusCode || 500
  const message = statusCode === 500 
    ? 'Internal server error' 
    : err.message

  res.status(statusCode).json({ 
    error: message,
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  })
}

export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message)
    this.statusCode = statusCode
  }
}
