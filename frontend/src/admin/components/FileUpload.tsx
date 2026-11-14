import { Upload } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { fitImage } from './imageResize'
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
  const [preparing, setPreparing] = useState(false)
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
        onChange={async (event) => {
          const picked = event.target.files?.[0]
          event.target.value = ''
          if (!picked) return
          if (!allowed.includes(picked.type)) {
            onInvalid(`That file type isn't supported. ${hint}.`)
            return
          }
          // Large photos are shrunk here; the server still checks type and size.
          setPreparing(true)
          const file = await fitImage(picked, maxBytes).finally(() => setPreparing(false))
          if (file.size > maxBytes) {
            onInvalid(`That file is too large. ${hint}.`)
          } else {
            onFile(file)
          }
        }}
      />
      <StudioButton
        size="sm"
        icon={<Upload size={16} aria-hidden="true" />}
        loading={busy || preparing}
        aria-describedby={hintId}
        onClick={() => input.current?.click()}
      >
        {preparing ? 'Preparing…' : busy ? 'Uploading…' : label}
      </StudioButton>
      <p id={hintId} className="mt-1.5 text-xs text-muted">
        {hint}
      </p>
    </div>
  )
}

/** Upload limits; must match the backend (4 MB on AWS Lambda, set by VITE_MAX_*_MB at build time). */
const MB = 1024 * 1024
const imageMb = Number(import.meta.env.VITE_MAX_IMAGE_MB) || 5
const documentMb = Number(import.meta.env.VITE_MAX_DOCUMENT_MB) || 10

export const IMAGE_TYPES = 'image/png,image/jpeg,image/webp'
export const IMAGE_HINT = `PNG, JPEG or WebP, up to ${imageMb} MB (large photos are resized automatically)`
export const IMAGE_MAX = imageMb * MB
export const DOCUMENT_HINT = `PDF, up to ${documentMb} MB`
export const DOCUMENT_MAX = documentMb * MB
