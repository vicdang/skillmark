import { useRef, useState } from 'react'
import { Upload, FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  onUpload: (file: File) => Promise<void>
  uploading?: boolean
  existingUrl?: string
}

export function RfpUploadZone({ onUpload, uploading, existingUrl }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const validate = (f: File) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowed.includes(f.type)) {
      setError('Only PDF and DOCX files are accepted.')
      return false
    }
    if (f.size > 20 * 1024 * 1024) {
      setError('File must be under 20 MB.')
      return false
    }
    return true
  }

  const pick = (f: File) => {
    setError(null)
    if (!validate(f)) return
    setFile(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) pick(f)
  }

  const handleUpload = async () => {
    if (!file) return
    await onUpload(file)
    setFile(null)
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors',
          dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'
        )}
      >
        <Upload size={24} className="text-muted-foreground" />
        <p className="text-sm text-muted-foreground text-center">
          Drag & drop a PDF or DOCX here, or click to browse
        </p>
        <p className="text-xs text-muted-foreground">Max 20 MB</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) pick(f) }}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      {file && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
          <FileText size={16} className="shrink-0 text-muted-foreground" />
          <span className="flex-1 text-sm truncate">{file.name}</span>
          <button onClick={() => setFile(null)} className="text-muted-foreground hover:text-foreground">
            <X size={14} />
          </button>
          <Button size="sm" onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload & Extract'}
          </Button>
        </div>
      )}

      {existingUrl && !file && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText size={14} />
          <a href={existingUrl} target="_blank" rel="noreferrer" className="underline hover:text-foreground truncate">
            View uploaded RFP
          </a>
        </div>
      )}
    </div>
  )
}
