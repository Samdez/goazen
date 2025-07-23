import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/utils'
import { useDescription, useTsController } from '@ts-react/form'

export default function TextArea() {
  const { field, error } = useTsController<string>()
  const { label, placeholder } = useDescription()

  // Extract custom classes from description (format: "Label // Placeholder // classes")
  const customClasses = label?.split('//')[2]?.trim() || ''

  return (
    <>
      <Textarea
        value={field.value ? field.value : ''} // conditional to prevent "uncontrolled to controlled" react warning
        onChange={(e) => {
          field.onChange(e.target.value)
        }}
        name={label?.split('//')[0]?.trim()}
        placeholder={placeholder}
        className={cn('p-2', customClasses)}
      />
      {error?.errorMessage && <span className="text-red-500">{error?.errorMessage}</span>}
    </>
  )
}
