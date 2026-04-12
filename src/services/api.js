/**
 * API Client — Centralized HTTP client for all backend communication.
 * Handles auth tokens, error handling, and response parsing.
 */

const API_BASE = import.meta.env?.VITE_API_URL || "/api";

class ApiClient {
  constructor() {
    this.token = localStorage.getItem("iq-token") || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem("iq-token", token);
    } else {
      localStorage.removeItem("iq-token");
    }
  }

  getToken() {
    if (!this.token) {
      this.token = localStorage.getItem("iq-token");
    }
    return this.token;
  }

  async request(method, path, body = null, options = {}) {
    const headers = { ...options.headers };
    const token = this.getToken();

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
      method,
      headers,
    };

    if (body) {
      if (body instanceof FormData) {
        // Don't set Content-Type for FormData — browser will set it with boundary
        config.body = body;
      } else {
        headers["Content-Type"] = "application/json";
        config.body = JSON.stringify(body);
      }
    }

    try {
      const response = await fetch(`${API_BASE}${path}`, config);

      if (response.status === 401) {
        // Auto-clear expired tokens
        this.setToken(null);
        localStorage.removeItem("iq-user");
        window.dispatchEvent(new CustomEvent("auth:expired"));
      }

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ error: `HTTP ${response.status}` }));
        throw new ApiError(
          error.error || error.message || error.details || "Request failed",
          response.status,
          error,
        );
      }

      return response.json();
    } catch (err) {
      if (err instanceof ApiError) throw err;

      // Handle network errors
      console.error("[ApiClient] Network error:", err);
      throw new ApiError(
        "Connection error. Please ensure the backend server is running.",
        0,
        err,
      );
    }
  }

  // ── Auth ─────────────────────────────────────────────
  async register({ email, password, name }) {
    const data = await this.request("POST", "/auth/register", {
      email,
      password,
      name,
    });
    this.setToken(data.token);
    return data;
  }

  async login({ email, password }) {
    const data = await this.request("POST", "/auth/login", { email, password });
    this.setToken(data.token);
    return data;
  }

  async loginWithGoogle(credential) {
    const data = await this.request("POST", "/auth/google", { credential });
    this.setToken(data.token);
    return data;
  }

  async getMe() {
    return this.request("GET", "/auth/me");
  }

  async updateProfile({ name, avatarUrl }) {
    return this.request("PUT", "/auth/profile", { name, avatarUrl });
  }

  logout() {
    this.setToken(null);
  }

  // ── Resume ───────────────────────────────────────────
  async uploadResume(file) {
    const formData = new FormData();
    formData.append("resume", file);
    return this.request("POST", "/resume/upload", formData);
  }

  async listResumes() {
    return this.request("GET", "/resume/list");
  }

  async getResume(id) {
    return this.request("GET", `/resume/${id}`);
  }

  async deleteResume(id) {
    return this.request("DELETE", `/resume/${id}`);
  }

  // ── Interview ────────────────────────────────────────
  async startInterview({
    role,
    persona,
    level,
    resumeId,
    jobDescription,
    questionCount,
  }) {
    return this.request("POST", "/interview/start", {
      role,
      persona,
      level,
      resumeId,
      jobDescription,
      questionCount,
    });
  }

  async submitAnswer({ sessionId, answer, questionIndex }) {
    return this.request("POST", "/interview/answer", {
      sessionId,
      answer,
      questionIndex,
    });
  }

  async endInterview(sessionId) {
    return this.request("POST", "/interview/end", { sessionId });
  }

  async getInterviewResult(sessionId) {
    return this.request("GET", `/interview/result/${sessionId}`);
  }

  async getInterviewHistory(limit = 20, offset = 0) {
    return this.request(
      "GET",
      `/interview/history?limit=${limit}&offset=${offset}`,
    );
  }

  async getInterviewStats() {
    return this.request("GET", "/interview/stats");
  }

  // ── Code Execution ───────────────────────────────────
  async executeCode({ code, language, stdin, testCases }) {
    return this.request("POST", "/code/execute", {
      code,
      language,
      stdin,
      testCases,
    });
  }

  async runCompiler({ code, language, testCases }) {
    return this.request("POST", "/compiler/run", { code, language, testCases });
  }

  async getRuntimes() {
    return this.request("GET", "/code/runtimes");
  }

  // ── Health ───────────────────────────────────────────
  async healthCheck() {
    const response = await fetch("/health");
    return response.json();
  }
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

// Singleton instance
const api = new ApiClient();
export default api;
