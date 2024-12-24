import { Input } from '@/components/ui/input'
import { useDescription, useTsController } from '@ts-react/form'

export default function TextField() {
  const { field, error } = useTsController<string>()
  const { label, placeholder } = useDescription()
  return (
    <>
      <Input
        value={field.value ? field.value : ''} // conditional to prevent "uncontrolled to controlled" react warning
        onChange={(e) => {
          field.onChange(e.target.value)
        }}
        name={label}
        placeholder={placeholder}
        className="p-2"
      />
      {error?.errorMessage && <span>{error?.errorMessage}</span>}
    </>
  )
}
