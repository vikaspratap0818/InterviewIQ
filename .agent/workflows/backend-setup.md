---
description: How to set up and run the AI Interview Platform backend
---

# Backend Setup & Run

## Prerequisites
- Node.js 18+ installed
- A Google Gemini API key (free at https://aistudio.google.com/apikey)

## First-Time Setup

1. Install server dependencies:
```
cd server
npm install
```

2. Configure environment variables:
- Open `server/.env`
- Add your Gemini API key: `GEMINI_API_KEY=your-key-here`
- The JWT secret and other defaults are pre-configured for development

## Running the Application

3. Start the backend server (Terminal 1):
```
cd server
npm run dev
```
The server will start at http://localhost:3001

4. Start the frontend dev server (Terminal 2):
```
npm run dev
```
The frontend will start at http://localhost:5173

## Architecture

- **Backend**: `server/` — Node.js + Express + SQLite
  - `server/index.js` — Main entry point
  - `server/routes/` — API endpoints (auth, resume, interview, code)
  - `server/services/` — Business logic (LLM, resume parser, code executor)
  - `server/db/` — SQLite database schema
  - `server/middleware/` — Auth & error handling

- **Frontend**: `src/` — React + Vite
  - `src/services/api.js` — API client for all backend calls
  - `src/context/AppContext.jsx` — Global state wired to backend
  - All pages now use real backend APIs

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login with email/password |
| POST | /api/auth/google | Google OAuth login |
| GET | /api/auth/me | Get current user |
| POST | /api/resume/upload | Upload & parse resume |
| GET | /api/resume/list | List user's resumes |
| POST | /api/interview/start | Start interview session |
| POST | /api/interview/answer | Submit answer & get next question |
| POST | /api/interview/end | End interview early |
| GET | /api/interview/result/:id | Get interview results |
| GET | /api/interview/history | Get interview history |
| GET | /api/interview/stats | Get performance stats |
| POST | /api/code/execute | Execute code in sandbox |
| GET | /health | Server health check |
