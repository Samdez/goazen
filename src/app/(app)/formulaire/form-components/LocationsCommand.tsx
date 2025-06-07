import { Button } from '@/components/ui/button'
import { cn } from '@/utils'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import { ChevronsUpDown, Check } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
import { LocationSchema } from '../form.client'
import { Location } from '@/payload-types'
import { useTsController } from '@ts-react/form'

export function LocationsCommand({ locations }: { locations: Location[] }) {
  const {
    field: { onChange, value },
    error,
  } = useTsController<z.infer<typeof LocationSchema>>()

  const [open, setOpen] = useState(false)

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn('w-[200px] justify-between', error?.errorMessage && 'border-red-500')}
          >
            {value
              ? locations.find((location) => location.id === value.id)?.name
              : 'Sélectionne ton lieu'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Rechercher" />
            <CommandList>
              <CommandEmpty>No framework found.</CommandEmpty>
              <CommandGroup>
                {locations.map((location) => (
                  <CommandItem
                    key={location.id}
                    value={location.name}
                    onSelect={() => {
                      onChange({
                        ...value,
                        name: location.name,
                        id: location.id,
                      })
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value?.name === location.name ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {location.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error?.errorMessage && <span className="text-red-500">{error?.errorMessage}</span>}
    </>
  )
}
