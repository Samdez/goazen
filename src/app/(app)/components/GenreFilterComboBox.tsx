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
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle } from '@/components/ui/drawer'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useRouter } from 'next/navigation'
import { createHref } from '@/utils'
import { Category } from '@/payload-types'
import { useCategory } from '../hooks/useGenre'
import { ChevronDownIcon } from 'lucide-react'

export function GenreFilterComboBox({ categories }: { categories: Category[] }) {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const category = useCategory()

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[150px] justify-center h-full">
            {category ? <>{category}</> : <>Tous les genres</>}
            <ChevronDownIcon className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <StatusList setOpen={setOpen} categories={categories} />
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-[130px] justify-start">
          {category ? <>{category}</> : <>Tous les genres</>}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerTitle className="sr-only">Sélectionne un genre</DrawerTitle>
        <div className="mt-4 border-t">
          <StatusList setOpen={setOpen} categories={categories} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function StatusList({
  setOpen,
  categories,
}: {
  setOpen: (open: boolean) => void
  categories: Category[]
}) {
  const router = useRouter()
  return (
    <Command>
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {categories.map((category) => (
            <CommandItem
              key={category.name}
              value={category.id}
              onSelect={() => {
                router.push(createHref({ category: category.slug || '' }))
                setOpen(false)
              }}
            >
              {category.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
