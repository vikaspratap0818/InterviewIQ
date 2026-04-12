const PISTON_URL =
  process.env.PISTON_API_URL || "https://emkc.org/api/v2/piston";
const JUDGE0_URL = "https://judge0-ce.p.rapidapi.com";

// Language mapping for Piston API
const PISTON_MAP = {
  javascript: { language: "js", version: "18.15.0" },
  python: { language: "python", version: "3.10.0" },
  python3: { language: "python", version: "3.10.0" },
  cpp: { language: "cpp", version: "10.2.0" },
  "c++": { language: "cpp", version: "10.2.0" },
  c: { language: "c", version: "10.2.0" },
  java: { language: "java", version: "15.0.2" },
  typescript: { language: "typescript", version: "5.0.3" },
  go: { language: "go", version: "1.16.2" },
  rust: { language: "rust", version: "1.68.2" },
};

// Language mapping for Judge0 CE API
const JUDGE0_MAP = {
  javascript: 93, // Node.js 18.15.0
  python: 71, // Python 3.8.1
  python3: 71,
  cpp: 54, // C++ (GCC 9.2.0)
  "c++": 54,
  c: 50, // C (GCC 9.2.0)
  java: 62, // Java (OpenJDK 13.0.1)
  typescript: 74, // TypeScript 3.7.4
  go: 60, // Go 1.13.5
  rust: 73, // Rust 1.40.0
};

/**
 * Execute code in a sandboxed environment using Judge0 (LeetCode feel) or fallback to Piston.
 * Supports running against test cases.
 */
export async function executeCode(
  code,
  language,
  stdin = "",
  expectedOutput = null,
) {
  const langKey = language.toLowerCase();
  const rapidApiKey = process.env.RAPIDAPI_KEY;

  // If we have a RapidAPI Key, use Judge0 for the LeetCode experience
  if (rapidApiKey && JUDGE0_MAP[langKey]) {
    try {
      const result = await executeJudge0(
        code,
        JUDGE0_MAP[langKey],
        stdin,
        expectedOutput,
        rapidApiKey,
      );

      // Check if we should fallback (429 or other specific errors)
      if (result.status === "Rate Limit" || result.error?.includes("429")) {
        console.warn(
          `[Code] Judge0 Rate Limit hit, falling back to Piston for ${language}`,
        );
        return await executePiston(code, langKey, stdin, expectedOutput);
      }

      return result;
    } catch (err) {
      console.error(
        `[Code] Judge0 failed: ${err.message}, falling back to Piston`,
      );
      return await executePiston(code, langKey, stdin, expectedOutput);
    }
  }

  // Fallback to Piston (Free, no key needed)
  return await executePiston(code, langKey, stdin, expectedOutput);
}

async function executeJudge0(code, languageId, stdin, expectedOutput, apiKey) {
  try {
    const base64Code = Buffer.from(code).toString("base64");
    const base64Stdin = Buffer.from(stdin || "").toString("base64");
    const base64ExpectedOutput = expectedOutput
      ? Buffer.from(expectedOutput).toString("base64")
      : null;

    // 1. Submit the code
    const submitRes = await fetch(
      `${JUDGE0_URL}/submissions?base64_encoded=true&wait=false`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
        body: JSON.stringify({
          language_id: languageId,
          source_code: base64Code,
          stdin: base64Stdin,
          expected_output: base64ExpectedOutput,
        }),
      },
    );

    if (submitRes.status === 429) {
      return {
        status: "Rate Limit",
        error: "429 Too Many Requests",
        exitCode: 1,
      };
    }

    if (!submitRes.ok) {
      throw new Error(
        `Judge0 Submit Error: ${submitRes.status} ${await submitRes.text()}`,
      );
    }

    const { token } = await submitRes.json();

    // 2. Poll for results
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      await new Promise((r) => setTimeout(r, 1500));

      const pollRes = await fetch(
        `${JUDGE0_URL}/submissions/${token}?base64_encoded=true`,
        {
          headers: {
            "X-RapidAPI-Key": apiKey,
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          },
        },
      );

      if (!pollRes.ok) {
        throw new Error(`Judge0 Poll Error: ${pollRes.status}`);
      }

      const data = await pollRes.json();
      const statusId = data.status?.id;

      // Status IDs: 1: In Queue, 2: Processing, 3: Accepted, 4: Wrong Answer, etc.
      if (statusId > 2) {
        const decode = (str) =>
          str ? Buffer.from(str, "base64").toString("utf-8") : "";

        const isError = statusId !== 3 && statusId !== 4;

        return {
          output: decode(data.stdout) || "",
          error:
            decode(data.stderr) ||
            decode(data.compile_output) ||
            (isError ? data.status?.description : ""),
          exitCode: isError ? 1 : 0,
          memory: data.memory, // in KB
          time: data.time ? parseFloat(data.time) * 1000 : 0, // convert to ms
          status: data.status?.description,
          passed: expectedOutput ? statusId === 3 : true,
        };
      }

      attempts++;
    }

    throw new Error("Judge0 execution timed out during polling");
  } catch (err) {
    return {
      output: "",
      error: `Judge0 execution failed: ${err.message}`,
      exitCode: 1,
      status: "Internal Error",
    };
  }
}

async function executePiston(code, langKey, stdin, expectedOutput) {
  const langConfig = PISTON_MAP[langKey];

  if (!langConfig) {
    return {
      output: "",
      error: `Unsupported language: ${langKey}.`,
      exitCode: 1,
    };
  }

  try {
    const response = await fetch(`${PISTON_URL}/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: langConfig.language,
        version: langConfig.version,
        files: [{ name: getFilename(langKey), content: code }],
        stdin: stdin || "",
        run_timeout: 5000,
        compile_timeout: 5000,
      }),
    });

    if (!response.ok) {
      return {
        output: "",
        error: `Code execution service error: ${response.status}`,
        exitCode: 1,
      };
    }

    const data = await response.json();
    const compileResult = data.compile;
    const runResult = data.run;

    if (compileResult && compileResult.stderr) {
      return {
        output: compileResult.stdout || "",
        error: compileResult.stderr,
        exitCode: compileResult.code || 1,
        status: "Compile Error",
      };
    }

    const output = (runResult?.stdout || "").substring(0, 10000);
    let passed = true;
    let status = "Accepted";

    if (expectedOutput) {
      passed = output.trim() === expectedOutput.trim();
      status = passed ? "Accepted" : "Wrong Answer";
    }

    return {
      output,
      error: (runResult?.stderr || "").substring(0, 5000),
      exitCode: runResult?.code ?? 0,
      status,
      passed,
      time: 0,
      memory: 0,
    };
  } catch (err) {
    return {
      output: "",
      error: err.message,
      exitCode: 1,
      status: "Internal Error",
    };
  }
}

export async function getAvailableRuntimes() {
  // Return unified list
  return Object.keys(PISTON_MAP).map((key) => ({
    language: key,
    version: "latest",
    aliases: [key],
  }));
}

function getFilename(language) {
  const map = {
    javascript: "main.js",
    python: "main.py",
    python3: "main.py",
    cpp: "main.cpp",
    "c++": "main.cpp",
    c: "main.c",
    java: "Main.java",
    typescript: "main.ts",
    go: "main.go",
    rust: "main.rs",
  };
  return map[language] || "main.txt";
}
