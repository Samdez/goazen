import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useTsController } from '@ts-react/form'
import { RegionSchema } from '../form.client'
import { z } from 'zod'

type RegionType = 'pays basque' | 'landes'

export default function Radio({ options }: { options: RegionType[] }) {
  const { field, error } = useTsController<z.infer<typeof RegionSchema>>()
  return (
    <>
      <RadioGroup
        value={field.value?.region || undefined}
        onValueChange={(value: RegionType) => field.onChange({ region: value })}
        className="flex flex-col gap-2 md:flex-row"
      >
        {options.map((e) => (
          <div className="flex items-center gap-3" key={e}>
            <RadioGroupItem value={e} id={e} />
            <Label htmlFor={e}>{e}</Label>
          </div>
        ))}
      </RadioGroup>
      {error?.errorMessage && <span className="text-red-500 font-text">{error.errorMessage}</span>}
    </>
  )
}
