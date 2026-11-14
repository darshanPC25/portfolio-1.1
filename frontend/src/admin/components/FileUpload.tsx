import { Upload } from 'lucide-react'
import { useId, useRef } from 'react'
import { StudioButton } from './ui'

interface FileUploadProps {
  label: string
  accept: string
  /** Shown under the button, e.g. "PNG, JPEG or WebP, up to 5 MB". */
  hint: string
  maxBytes: number
  busy?: boolean
  onFile: (file: File) => void
  onInvalid: (message: string) => void
}

/** Accessible file picker with client-side type and size checks (the server checks again). */
export function FileUpload({ label, accept, hint, maxBytes, busy = false, onFile, onInvalid }: FileUploadProps) {
  const input = useRef<HTMLInputElement>(null)
  const hintId = useId()
  const allowed = accept.split(',').map((type) => type.trim())

  return (
    <div>
      <input
        ref={input}
        type="file"
        accept={accept}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (!file) return
          if (!allowed.includes(file.type)) {
            onInvalid(`That file type isn't supported. ${hint}.`)
          } else if (file.size > maxBytes) {
            onInvalid(`That file is too large. ${hint}.`)
          } else {
            onFile(file)
          }
        }}
      />
      <StudioButton
        size="sm"
        icon={<Upload size={16} aria-hidden="true" />}
        loading={busy}
        aria-describedby={hintId}
        onClick={() => input.current?.click()}
      >
        {busy ? 'Uploading…' : label}
      </StudioButton>
      <p id={hintId} className="mt-1.5 text-xs text-muted">
        {hint}
      </p>
    </div>
  )
}

export const IMAGE_TYPES = 'image/png,image/jpeg,image/webp'
export const IMAGE_HINT = 'PNG, JPEG or WebP, up to 5 MB'
export const IMAGE_MAX = 5 * 1024 * 1024
