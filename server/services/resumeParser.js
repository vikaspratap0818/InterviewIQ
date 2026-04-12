import fs from "fs";
import path from "path";
import pdf from "pdf-parse";
import mammoth from "mammoth";

/**
 * Parse resume from an uploaded file buffer.
 * Supports PDF and DOCX formats.
 * Returns structured resume data.
 */
export async function parseResume(fileBuffer, filename) {
  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error("Empty file buffer provided");
  }

  const ext = path.extname(filename || "").toLowerCase();
  let rawText = "";

  console.log(`[ResumeParser] Parsing file: ${filename}, extension: ${ext}`);

  try {
    if (ext === ".pdf") {
      rawText = await parsePDF(fileBuffer);
    } else if (ext === ".docx") {
      rawText = await parseDOCX(fileBuffer);
    } else if (ext === ".doc") {
      throw new Error(
        "Legacy .doc format is not supported. Please save as .docx or .pdf",
      );
    } else if (ext === ".txt") {
      rawText = fileBuffer.toString("utf-8");
    } else {
      // Try to treat as text if extension is unknown
      rawText = fileBuffer.toString("utf-8");
    }
  } catch (err) {
    console.error(`[ResumeParser] Error during text extraction:`, err.message);
    throw new Error(
      `Failed to extract text from ${ext.toUpperCase()} file: ${err.message}`,
    );
  }

  if (!rawText || rawText.trim().length < 10) {
    throw new Error(
      "Could not extract meaningful text from the file. The file might be encrypted, empty, or an unsupported format.",
    );
  }

  console.log(
    `[ResumeParser] Text extracted successfully (${rawText.length} chars). Structuring...`,
  );
  const structuredData = extractStructuredData(rawText);

  return {
    rawText: rawText.substring(0, 15000), // Increased cap slightly
    structured: structuredData,
  };
}

async function parsePDF(buffer) {
  try {
    console.log("[ResumeParser] Step 1.1: Calling pdf-parse...");
    // Create a promise that rejects after 30 seconds
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("PDF parsing timed out after 30s")),
        30000,
      ),
    );

    const data = await Promise.race([pdf(buffer), timeoutPromise]);
    console.log(
      "[ResumeParser] Step 1.1 completed. Data length:",
      data?.text?.length || 0,
    );
    return data.text;
  } catch (err) {
    console.error("[ResumeParser] PDF Parse Error:", err.message);
    throw new Error(`PDF parse failed: ${err.message}`);
  }
}

async function parseDOCX(buffer) {
  try {
    console.log("[ResumeParser] Step 1.2: Calling mammoth...");
    const result = await mammoth.extractRawText({ buffer });
    console.log(
      "[ResumeParser] Step 1.2 completed. Data length:",
      result?.value?.length || 0,
    );
    return result.value;
  } catch (err) {
    console.error("[ResumeParser] DOCX Parse Error:", err.message);
    throw new Error(`DOCX parse failed: ${err.message}`);
  }
}

/**
 * Extract structured data from raw resume text using regex patterns.
 * This is a heuristic approach — works well for most standard resumes.
 */
function extractStructuredData(text) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // Extract email
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w{2,}/i);
  const email = emailMatch ? emailMatch[0] : null;

  // Extract phone
  const phoneMatch = text.match(
    /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
  );
  const phone = phoneMatch ? phoneMatch[0] : null;

  // Extract name (usually first non-empty line)
  const name = lines[0] || "Unknown";

  // Extract skills (look for common skill-related sections)
  const skills = extractSection(text, [
    "skills",
    "technical skills",
    "technologies",
    "tech stack",
    "programming languages",
    "tools",
    "competencies",
  ]);

  // Extract experience
  const experience = extractSection(text, [
    "experience",
    "work experience",
    "professional experience",
    "employment",
    "work history",
  ]);

  // Extract education
  const education = extractSection(text, [
    "education",
    "academic",
    "qualifications",
    "degrees",
  ]);

  // Extract projects
  const projects = extractSection(text, [
    "projects",
    "personal projects",
    "notable projects",
    "portfolio",
  ]);

  // Extract certifications
  const certifications = extractSection(text, [
    "certifications",
    "certificates",
    "licenses",
  ]);

  // Parse individual sections into arrays if needed
  const skillsList = parseSkillsList(skills);
  const experienceList = parseSectionToList(experience);
  const projectsList = parseSectionToList(projects);

  return {
    name,
    email,
    phone,
    skills: skillsList,
    skillsRaw: skills,
    experience: experienceList,
    experienceRaw: experience,
    education,
    projects: projectsList,
    projectsRaw: projects,
    certifications,
    summary: text.substring(0, 500),
  };
}

/**
 * Helper to convert section text into an array of items (bullets or lines).
 */
function parseSectionToList(sectionText) {
  if (!sectionText) return [];

  return sectionText
    .split(/\n+/)
    .map((line) => line.trim().replace(/^[•·\-*]\s*/, ""))
    .filter((line) => line.length > 5);
}

/**
 * Extract a section from resume text based on header keywords.
 */
function extractSection(text, sectionHeaders) {
  const allHeaders = [
    "skills",
    "technical skills",
    "technologies",
    "experience",
    "work experience",
    "professional experience",
    "education",
    "projects",
    "certifications",
    "summary",
    "objective",
    "achievements",
    "awards",
    "publications",
    "references",
    "languages",
    "interests",
    "hobbies",
    "volunteer",
    "personal projects",
    "portfolio",
    "competencies",
    "employment",
    "work history",
    "academic",
    "qualifications",
  ];

  for (const header of sectionHeaders) {
    // Create a regex that looks for the section header
    const headerRegex = new RegExp(
      `(?:^|\\n)\\s*(?:#{1,3}\\s*)?${header}\\s*[:\\-—]?\\s*(?:\\n|$)`,
      "im",
    );
    const match = text.match(headerRegex);
    if (!match) continue;

    const startIndex = match.index + match[0].length;

    // Find next section header
    let endIndex = text.length;
    for (const otherHeader of allHeaders) {
      if (sectionHeaders.includes(otherHeader)) continue;
      const nextRegex = new RegExp(
        `(?:^|\\n)\\s*(?:#{1,3}\\s*)?${otherHeader}\\s*[:\\-—]?\\s*(?:\\n|$)`,
        "im",
      );
      const nextMatch = text.substring(startIndex).match(nextRegex);
      if (nextMatch && startIndex + nextMatch.index < endIndex) {
        endIndex = startIndex + nextMatch.index;
      }
    }

    const section = text.substring(startIndex, endIndex).trim();
    if (section.length > 10) return section;
  }

  return "";
}

/**
 * Parse skills section into individual skill items.
 */
function parseSkillsList(skillsText) {
  if (!skillsText) return [];

  // Split by common delimiters
  const skills = skillsText
    .split(/[,;|•·\n\r]+/)
    .map((s) => s.replace(/[-–—]/g, "").trim())
    .filter((s) => s.length > 1 && s.length < 50)
    .map((s) => s.replace(/^\d+\.\s*/, "")) // Remove numbering
    .filter(Boolean);

  // Deduplicate
  return [...new Set(skills)];
}
