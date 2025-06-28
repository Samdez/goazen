'use client'

import { Button } from '@/components/ui/button'
import { Category, City } from '@/payload-types'
import FilterSectionText from './FilterSectionText'
import GenreButton from './GenreButton'
import { useRouter } from 'next/navigation'
import { createHref } from '@/utils'
import { useCategory } from '../hooks/useGenre'

function FilterByCity({ activeCity, cities }: { activeCity: string; cities: City[] }) {
  return (
    <div className="pb-8 px-4 md:px-32">
      <div className="flex w-full flex-wrap justify-evenly gap-1 py-4">
        {cities.map((city) => {
          return (
            <FilterButton
              path={`/salles-de-concert?city=${city.slug}`}
              text={city.name}
              key={city.id}
              activeCity={activeCity}
              slug={city.slug}
            />
          )
        })}
      </div>
    </div>
  )
}

function FilterButton({
  path,
  text,
  slug,
  activeCity,
}: {
  path: string
  text: string
  slug?: string | null
  activeCity: string
}) {
  const router = useRouter()
  return (
    <Button
      className={`hover:bg-black[#E2B748]  h-10 w-20 text-pretty border-2 border-black bg-white text-black hover:border-none hover:text-[#E45110] ${
        activeCity === slug && 'border-none text-[#E45110]'
      }`}
      onClick={() => router.push(path)}
    >
      {text}
    </Button>
  )
}

export default FilterByCity
