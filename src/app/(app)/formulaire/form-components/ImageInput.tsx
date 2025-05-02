import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTsController, useDescription } from '@ts-react/form'
import { useState, useEffect } from 'react'
import Image from 'next/image'

export function InputFile() {
  const { field, error } = useTsController()
  const { label, placeholder } = useDescription()
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)
      field.onChange(file)
    }
  }

  useEffect(() => {
    return () => {
      // Cleanup preview URL when component unmounts
      if (preview) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="picture" className="cursor-pointer">
        {label}
      </Label>
      <Input
        id="picture"
        type="file"
        accept="image/*"
        className="hover:file:cursor-pointer cursor-pointer"
        onChange={handleFileChange}
      />
      {preview && (
        <div className="mt-2">
          <Image src={preview} alt="Preview" className="max-w-[200px] rounded-md" unoptimized />
        </div>
      )}
      {error?.errorMessage && <span className="text-sm text-red-500">{error?.errorMessage}</span>}
    </div>
  )
}
