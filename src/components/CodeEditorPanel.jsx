import { useState, useMemo } from "react";
import Editor from "@monaco-editor/react";
import {
  Code2,
  Play,
  Maximize2,
  Settings2,
  CheckCircle2,
  XCircle,
  Clock,
  Database,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  Sparkles,
} from "lucide-react";

function TestResultItem({ res, index }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-all hover:bg-white/[0.04]">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-tighter hover:text-slate-300 transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
          Case {index + 1}
        </button>
        {res.passed ? (
          <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold">
            <CheckCircle2 className="h-3 w-3" /> PASSED
          </div>
        ) : (
          <div className="flex items-center gap-1 text-rose-400 text-[10px] font-bold">
            <XCircle className="h-3 w-3" /> FAILED
          </div>
        )}
      </div>

      <div className="space-y-2 font-mono text-[11px]">
        <div>
          <div className="text-slate-600 mb-0.5">Input:</div>
          <div className="bg-black/30 rounded px-2 py-1 text-slate-300 truncate">
            {res.input || "None"}
          </div>
        </div>

        {isExpanded ? (
          <>
            <div>
              <div className="text-slate-600 mb-0.5">Expected:</div>
              <pre className="bg-black/30 rounded px-2 py-1 text-emerald-400/80 whitespace-pre-wrap break-all">
                {res.expectedOutput || "None"}
              </pre>
            </div>
            <div>
              <div className="text-slate-600 mb-0.5">Output:</div>
              <pre
                className={`bg-black/30 rounded px-2 py-1 whitespace-pre-wrap break-all ${res.passed ? "text-slate-300" : "text-rose-400"}`}
              >
                {res.actualOutput || (res.error ? "Error" : "None")}
              </pre>
            </div>
          </>
        ) : (
          <>
            <div>
              <div className="text-slate-600 mb-0.5">Expected:</div>
              <div className="bg-black/30 rounded px-2 py-1 text-emerald-400/80 truncate">
                {res.expectedOutput || "None"}
              </div>
            </div>
            <div>
              <div className="text-slate-600 mb-0.5">Output:</div>
              <div
                className={`bg-black/30 rounded px-2 py-1 truncate ${res.passed ? "text-slate-300" : "text-rose-400"}`}
              >
                {res.actualOutput || (res.error ? "Error" : "None")}
              </div>
            </div>
          </>
        )}
      </div>

      {(res.time || res.memory) && (
        <div className="mt-3 flex items-center gap-3 border-t border-white/[0.04] pt-2 text-[10px] text-slate-500">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {res.time}ms
          </div>
          <div className="flex items-center gap-1">
            <Database className="h-3 w-3" /> {Math.round(res.memory / 1024)}MB
          </div>
        </div>
      )}

      {res.error && isExpanded && (
        <div className="mt-2 rounded bg-rose-500/10 p-2 text-[10px] text-rose-400 whitespace-pre-wrap font-mono leading-relaxed">
          {res.error}
        </div>
      )}
    </div>
  );
}

export default function CodeEditorPanel({
  code,
  setCode,
  language = "python",
  setLanguage,
  onRun,
  isExecuting,
  results,
}) {
  const [theme, setTheme] = useState("vs-dark");

  const passedCount = useMemo(() => {
    if (!results?.testResults) return 0;
    return results.testResults.filter((r) => r.passed).length;
  }, [results]);

  const totalCount = results?.totalCount || 0;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1117] shadow-xl">
      {/* Editor Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#161b22] px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-white/5 px-2 py-1 text-xs font-medium text-slate-300 border border-white/10">
            <Code2 className="h-3.5 w-3.5 text-brand-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent border-none focus:outline-none capitalize cursor-pointer pr-1"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="typescript">TypeScript</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
            </select>
          </div>
          {totalCount > 0 && (
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                passedCount === totalCount
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              }`}
            >
              {passedCount === totalCount ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <AlertCircle className="h-3 w-3" />
              )}
              Passed {passedCount}/{totalCount} Cases
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setTheme((t) => (t === "vs-dark" ? "light" : "vs-dark"))
            }
            className="p-1.5 text-slate-400 hover:text-white transition-colors"
            title="Toggle Theme"
          >
            <Settings2 className="h-4 w-4" />
          </button>
          <button
            onClick={onRun}
            disabled={isExecuting}
            className="ml-2 flex items-center gap-1.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 px-4 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/30 transition-all disabled:opacity-50 shadow-glow-sm"
          >
            {isExecuting ? (
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
            ) : (
              <Play className="h-3 w-3 fill-current" />
            )}
            {isExecuting ? "Running..." : "Run Code"}
          </button>
        </div>
      </div>

      {/* Main Split View */}
      <div className="flex flex-1 flex-col xl:flex-row overflow-hidden">
        {/* Left: Editor */}
        <div className="flex-1 border-b xl:border-b-0 xl:border-r border-white/[0.04] min-h-[300px] xl:min-h-0">
          <Editor
            height="100%"
            language={language === "python3" ? "python" : language}
            theme={theme}
            value={code}
            onChange={(value) => setCode(value)}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              roundedSelection: false,
              scrollBeyondLastLine: false,
              readOnly: false,
              automaticLayout: true,
              padding: { top: 16, bottom: 16 },
              fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
              cursorStyle: "block",
              selectionHighlight: true,
              occurrencesHighlight: true,
            }}
          />
        </div>

        {/* Right: Results Panel */}
        <div className="w-full xl:w-[350px] flex flex-col bg-[#0d1117] overflow-hidden">
          <div className="flex items-center gap-2 border-b border-white/[0.04] bg-white/[0.02] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <Sparkles className="h-3 w-3" /> Test Results
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {results ? (
              <div className="space-y-4">
                {results.testResults?.map((res, i) => (
                  <TestResultItem key={i} res={res} index={i} />
                ))}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center opacity-40">
                <Play className="h-8 w-8 text-slate-600 mb-2" />
                <p className="text-xs text-slate-500">
                  Run your code to see results
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
