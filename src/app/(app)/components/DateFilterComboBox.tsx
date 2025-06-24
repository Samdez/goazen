'use client'

import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useParams, useRouter } from 'next/navigation'
import { createHref } from '@/utils'
import { useCategory } from '../hooks/useGenre'
import { ChevronDownIcon } from 'lucide-react'

export function DateFilterComboBox({ days }: { days: ['day', 'week'] }) {
  const params = useParams()
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const day = typeof params.day === 'string' ? params.day : params.day?.[0]

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[150px] justify-center h-full">
            {day ? <>{day}</> : <>Quand ?</>}
            <ChevronDownIcon className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <StatusList setOpen={setOpen} days={days} />
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-[130px] justify-start">
          {day ? <>{day}</> : <>Quand ?</>}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerTitle className="sr-only">Sélectionne une date</DrawerTitle>
        <div className="mt-4 border-t">
          <StatusList setOpen={setOpen} days={days} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function StatusList({
  setOpen,
  days,
}: {
  setOpen: (open: boolean) => void
  days: ['day', 'week']
}) {
  const router = useRouter()
  const category = useCategory()
  return (
    <Command>
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {days.map((day) => (
            <CommandItem
              key={day}
              value={day}
              onSelect={() => {
                router.push(createHref({ time: day, category: category }))
                setOpen(false)
              }}
            >
              {day === 'day' ? 'Ce soir' : 'cette semaine'}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
