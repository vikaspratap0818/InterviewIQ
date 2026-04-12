import path from "path";
import mongoose from "mongoose";
import { Router } from "express";
import multer from "multer";
import { Resume } from "../db/database.js";
import { authMiddleware } from "../middleware/auth.js";
import { asyncHandler, AppError } from "../middleware/errorHandler.js";
import { parseResume } from "../services/resumeParser.js";

const router = Router();

function getAuthenticatedUserObjectId(req) {
  if (!mongoose.Types.ObjectId.isValid(req.userId)) {
    throw new AppError(
      "Invalid or expired session pointer. Please log in again.",
      401,
    );
  }

  return new mongoose.Types.ObjectId(req.userId);
}

// Configure multer for in-memory file handling
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit (upgraded from 5MB)
    files: 1, // only 1 file per request
  },
  fileFilter: (req, file, cb) => {
    console.log(
      `[Multer] Filtering file: ${file.originalname} (${file.mimetype})`,
    );
    const allowedMimeTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = [".pdf", ".docx", ".txt"];

    if (
      allowedMimeTypes.includes(file.mimetype) ||
      allowedExtensions.includes(ext)
    ) {
      cb(null, true);
    } else {
      console.warn(`[Multer] Rejected file type: ${file.mimetype}`);
      cb(
        new AppError(
          "Invalid file type. Only PDF, DOCX, and TXT are supported.",
          400,
        ),
        false,
      );
    }
  },
});

// ── POST /resume/upload ──────────────────────────────────
router.post(
  "/upload",
  authMiddleware,
  (req, res, next) => {
    upload.single("resume")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(
            new AppError("File too large. Maximum size is 5MB.", 413),
          );
        }
        return next(new AppError(`Upload error: ${err.message}`, 400));
      } else if (err) {
        return next(err);
      }
      next();
    });
  },
  asyncHandler(async (req, res) => {
    const userObjectId = getAuthenticatedUserObjectId(req);

    console.log(
      `[Resume] Start processing: ${req.file?.originalname} (${req.file?.size} bytes)`,
    );
    if (!req.file) {
      throw new AppError("No file uploaded or invalid file type", 400);
    }

    try {
      console.log(
        `[Resume] Step 1: Parsing file with ${req.file.originalname.endsWith(".pdf") ? "pdf-parse" : "mammoth"}...`,
      );
      const startTime = Date.now();
      const { rawText, structured } = await parseResume(
        req.file.buffer,
        req.file.originalname,
      );
      const parseDuration = Date.now() - startTime;
      console.log(
        `[Resume] Step 1 completed in ${parseDuration}ms. Text length: ${rawText.length}`,
      );

      if (!structured) {
        throw new AppError(
          "Failed to extract structured data from resume",
          500,
        );
      }

      console.log(`[Resume] Step 2: Saving to MongoDB...`);
      const dbStartTime = Date.now();
      const resume = await Resume.create({
        user_id: userObjectId,
        filename: req.file.originalname,
        original_text: rawText,
        parsed_data: structured,
      });
      const dbDuration = Date.now() - dbStartTime;
      console.log(
        `[Resume] Step 2 completed in ${dbDuration}ms. Resume ID: ${resume._id}`,
      );

      res.status(201).json({
        id: resume._id.toString(),
        filename: resume.filename,
        skills: structured.skills || [],
        experience: structured.experience || [],
        projects: structured.projects || [],
        rawText: rawText || "",
      });
    } catch (error) {
      console.error(`[Resume] Error processing resume:`, error.message);
      if (error instanceof AppError) throw error;
      throw new AppError(`Resume processing failed: ${error.message}`, 500);
    }
  }),
);

// ── GET /resume/list ─────────────────────────────────────
router.get(
  "/list",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const userObjectId = getAuthenticatedUserObjectId(req);

    const resumes = await Resume.find({ user_id: userObjectId }).sort({
      uploaded_at: -1,
    });

    res.json(
      resumes.map((r) => ({
        id: r._id.toString(),
        filename: r.filename,
        parsed: r.parsed_data || {},
        uploadedAt: r.uploaded_at,
      })),
    );
  }),
);

// ── GET /resume/:id ──────────────────────────────────────
router.get(
  "/:id",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const userObjectId = getAuthenticatedUserObjectId(req);

    const resume = await Resume.findOne({
      _id: req.params.id,
      user_id: userObjectId,
    });

    if (!resume) {
      throw new AppError("Resume not found", 404);
    }

    res.json({
      id: resume._id.toString(),
      filename: resume.filename,
      rawText: resume.original_text,
      parsed: resume.parsed_data || {},
      uploadedAt: resume.uploaded_at,
    });
  }),
);

// ── DELETE /resume/:id ───────────────────────────────────
router.delete(
  "/:id",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const userObjectId = getAuthenticatedUserObjectId(req);

    const result = await Resume.deleteOne({
      _id: req.params.id,
      user_id: userObjectId,
    });

    if (result.deletedCount === 0) {
      throw new AppError("Resume not found", 404);
    }

    res.json({ message: "Resume deleted" });
  }),
);

export default router;
