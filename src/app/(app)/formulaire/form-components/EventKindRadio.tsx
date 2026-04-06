import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useTsController } from '@ts-react/form'
import type { z } from 'zod'
import { EventKindSchema } from '../event-kind-schema'

const EVENT_KIND_OPTIONS: { value: z.infer<typeof EventKindSchema>['event_kind']; label: string }[] =
  [
    { value: 'dj_set', label: 'Set DJ' },
    { value: 'live_show', label: 'Live show' },
    { value: 'other', label: 'Autre' },
  ]

export default function EventKindRadio() {
  const { field, error } = useTsController<z.infer<typeof EventKindSchema>>()
  return (
    <>
      <RadioGroup
        value={field.value?.event_kind || undefined}
        onValueChange={(value: z.infer<typeof EventKindSchema>['event_kind']) =>
          field.onChange({ event_kind: value })
        }
        className="flex flex-col gap-2 md:flex-row md:flex-wrap"
      >
        {EVENT_KIND_OPTIONS.map((option) => (
          <div className="flex items-center gap-3" key={option.value}>
            <RadioGroupItem value={option.value} id={`event-kind-${option.value}`} />
            <Label className="text-black" htmlFor={`event-kind-${option.value}`}>
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
      {error?.errorMessage && <span className="text-red-500 font-text">{error.errorMessage}</span>}
    </>
  )
}
