export type TargetImageFormat = 'image/png' | 'image/jpeg' | 'image/webp'

export interface ImageConversionOptions {
  format: TargetImageFormat
  quality?: number // 0.1 to 1.0 (for jpeg & webp)
  maxWidth?: number
  maxHeight?: number
  scale?: number // 0.1 to 2.0 multiplier
}

export interface ImageConversionResult {
  blob: Blob
  dataUrl: string
  filename: string
  width: number
  height: number
  originalSize: number
  convertedSize: number
  savingsPercent: number
}

/**
 * Converts an image file to target format (PNG, JPEG, WebP) with optional quality & scaling
 */
export async function convertImage(
  file: File,
  options: ImageConversionOptions
): Promise<ImageConversionResult> {
  const { format, quality = 0.9, maxWidth, maxHeight, scale = 1.0 } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      let width = img.naturalWidth * scale
      let height = img.naturalHeight * scale

      // Apply max width / height constraint while maintaining aspect ratio
      if (maxWidth && width > maxWidth) {
        const ratio = maxWidth / width
        width = maxWidth
        height = height * ratio
      }
      if (maxHeight && height > maxHeight) {
        const ratio = maxHeight / height
        height = maxHeight
        width = width * ratio
      }

      width = Math.round(width)
      height = Math.round(height)

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas 2D context unavailable.'))
        return
      }

      // If converting to JPEG, fill white background to handle transparency cleanly
      if (format === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, width, height)
      }

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to generate image blob.'))
            return
          }

          const dataUrl = canvas.toDataURL(format, quality)
          const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/webp' ? 'webp' : 'png'
          const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
          const filename = `${nameWithoutExt}.${ext}`

          const originalSize = file.size
          const convertedSize = blob.size
          const savingsPercent =
            originalSize > 0
              ? Math.round(((originalSize - convertedSize) / originalSize) * 100)
              : 0

          resolve({
            blob,
            dataUrl,
            filename,
            width,
            height,
            originalSize,
            convertedSize,
            savingsPercent,
          })
        },
        format,
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image file. Check if the file is a valid image.'))
    }

    img.src = url
  })
}

/** Format file size in human-readable string (KB, MB) */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
