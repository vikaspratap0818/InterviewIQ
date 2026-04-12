import { UploadCloud } from 'lucide-react'
import { useRef } from 'react'

export default function DropzoneUpload({ fileName, onFileSelect }) {
  const inputRef = useRef(null)

  const handleFile = (file) => {
    if (!file) return
    onFileSelect(file.name)
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        handleFile(e.dataTransfer.files[0])
      }}
      className="cursor-pointer rounded-2xl border border-dashed border-blue-300/25 bg-white/[0.03] p-8 text-center transition hover:bg-white/[0.05]"
    >
      <UploadCloud className="mx-auto mb-3 h-10 w-10 text-slate-300" />
      <p className="text-slate-200">Drag & drop your resume here, or click to browse.</p>
      <p className="mt-1 text-sm text-slate-400">Supports PDF, DOCX, or TXT.</p>
      {fileName && (
        <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-sm text-slate-300">
          {fileName} - Uploaded
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt,.doc,.docx"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  )
}
