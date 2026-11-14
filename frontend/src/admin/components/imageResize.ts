/**
 * Shrinks large photos in the browser before upload: at most MAX_EDGE pixels on
 * the long side, re-encoded as JPEG until it fits the size limit. Keeps uploads
 * under the serverless request limit and makes the public site load faster.
 * Small images are returned untouched.
 */
export const MAX_EDGE = 2400

export async function fitImage(file: File, maxBytes: number): Promise<File> {
  if (!file.type.startsWith('image/')) return file

  const bitmap = await createImageBitmap(file).catch(() => null)
  if (!bitmap) return file
  const longest = Math.max(bitmap.width, bitmap.height)
  if (file.size <= maxBytes && longest <= MAX_EDGE) {
    bitmap.close()
    return file
  }

  const scale = Math.min(1, MAX_EDGE / longest)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const context = canvas.getContext('2d')
  if (!context) return file
  // JPEG has no transparency: paint a light background first.
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  const name = file.name.replace(/\.[^.]+$/, '') + '.jpg'
  for (const quality of [0.9, 0.82, 0.74, 0.66]) {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
    if (blob && blob.size <= maxBytes) return new File([blob], name, { type: 'image/jpeg' })
  }
  return file // still too large: the size check reports it
}
