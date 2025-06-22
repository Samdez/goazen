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
import { City } from '@/payload-types'
import { Params } from 'next/dist/server/request/params'

export function CityFilterCombobox({
  cities,
  isLocationsPage,
}: {
  cities: City[]
  isLocationsPage?: boolean
}) {
  const params = useParams()
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[150px] justify-center h-16">
            {params.city ? params.city : 'Filtrer par ville'}
            <ChevronDownIcon className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <CitiesList
            setOpen={setOpen}
            cities={cities}
            params={params}
            isLocationsPage={isLocationsPage}
          />
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-[150px] justify-start">
          {params.city ? params.city : 'Filtrer par ville'}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerTitle className="sr-only">Filtrer par ville</DrawerTitle>
        <div className="mt-4 border-t">
          <CitiesList
            setOpen={setOpen}
            cities={cities}
            params={params}
            isLocationsPage={isLocationsPage}
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function CitiesList({
  setOpen,
  cities,
  params,
  isLocationsPage,
}: {
  setOpen: (open: boolean) => void
  cities: City[]
  params: Params
  isLocationsPage?: boolean
}) {
  const router = useRouter()
  const createHref = (city: City) => {
    if (isLocationsPage) {
      return `/salles-de-concert/${city.slug}`
    }
    return city.id === 'all'
      ? `/concerts/${params.region}`
      : `/concerts/${city.region}/${city.slug}`
  }
  return (
    <Command>
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {cities.map((city) => (
            <CommandItem
              key={city.id}
              value={city.id}
              onSelect={() => {
                router.push(createHref(city))
                setOpen(false)
              }}
            >
              {city.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
