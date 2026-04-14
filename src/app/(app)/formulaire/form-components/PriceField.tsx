import { Input } from '@/components/ui/input'
import { cn } from '@/utils'
import { useDescription, useTsController } from '@ts-react/form'

const PRICE_MAX_LENGTH = 20

export default function PriceField() {
  const { field, error } = useTsController<string>()
  const { label, placeholder } = useDescription()
  return (
    <>
      <Input
        value={field.value ? field.value : ''}
        onChange={(e) => {
          field.onChange(e.target.value.slice(0, PRICE_MAX_LENGTH))
        }}
        name={label}
        placeholder={placeholder}
        maxLength={PRICE_MAX_LENGTH}
        className={cn('p-2', error?.errorMessage && 'border-red-500')}
      />
      {error?.errorMessage && <span className="text-red-500">{error?.errorMessage}</span>}
    </>
  )
}
