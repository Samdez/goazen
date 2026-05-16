'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTsController, useDescription } from '@ts-react/form'
import imageCompression from 'browser-image-compression'
import Image from 'next/image'
import { useEffect, useState } from 'react'

const HEIC_EXTENSIONS = /\.(heic|heif)$/i
const HEIC_MIMES = ['image/heic', 'image/heif']
const COMPRESSION_OPTIONS = {
  maxSizeMB: 2,
  maxWidthOrHeight: 2000,
  useWebWorker: true,
  fileType: 'image/webp' as const,
  initialQuality: 0.82,
}

function isHeic(file: File) {
  return HEIC_MIMES.includes(file.type.toLowerCase()) || HEIC_EXTENSIONS.test(file.name)
}

async function heicToJpeg(file: File): Promise<File> {
  const { default: heic2any } = await import('heic2any')
  const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 })
  const blob = Array.isArray(converted) ? converted[0] : converted
  const baseName = file.name.replace(HEIC_EXTENSIONS, '')
  return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' })
}

export function InputFile() {
  const { field, error } = useTsController<File>()
  const { label } = useDescription()
  const [preview, setPreview] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0]
    if (!picked) return
    setLocalError(null)
    setIsProcessing(true)
    try {
      const decoded = isHeic(picked) ? await heicToJpeg(picked) : picked
      const compressed = await imageCompression(decoded, COMPRESSION_OPTIONS)
      const previewUrl = URL.createObjectURL(compressed)
      setPreview(previewUrl)
      field.onChange(compressed)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      setLocalError(`Impossible de traiter cette image (${message})`)
      field.onChange(undefined)
    } finally {
      setIsProcessing(false)
    }
  }

  const displayedError = localError ?? error?.errorMessage

  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="picture" className="cursor-pointer">
        {label}
      </Label>
      <Input
        id="picture"
        type="file"
        accept="image/*,.heic,.heif"
        disabled={isProcessing}
        className="hover:file:cursor-pointer cursor-pointer"
        onChange={handleFileChange}
      />
      {isProcessing && <span className="text-sm text-gray-500">Traitement de l’image…</span>}
      {preview && !isProcessing && (
        <div className="mt-2">
          <Image src={preview} alt="Preview" width={200} height={200} className="max-w-[200px] rounded-md" unoptimized />
        </div>
      )}
      {displayedError && <span className="text-sm text-red-500">{displayedError}</span>}
    </div>
  )
}
