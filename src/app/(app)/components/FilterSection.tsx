'use client'

import { Button } from '@/components/ui/button'
import { Category } from '@/payload-types'
import FilterSectionText from './FilterSectionText'
import GenreButton from './GenreButton'
import { useRouter } from 'next/navigation'
import { createHref } from '@/utils'
import { useCategory } from '../hooks/useGenre'

function FilterSection({
  activeTime,
  categories,
}: {
  activeTime?: 'week' | 'day' | undefined
  categories: Category[]
}) {
  const category = useCategory()
  const dayHRef = createHref({
    time: 'day',
    activeTime,
    category,
  })
  const weekHRef = createHref({
    time: 'week',
    activeTime,
    category,
  })
  return (
    <div className="pb-8 md:px-32">
      <FilterSectionText activeTime={activeTime} activeCategory={category} />
      <div className="md:flex">
        <div className="flex w-full flex-wrap justify-evenly gap-1 py-4 md:w-1/2">
          {categories.map((genre) => {
            return <GenreButton genre={genre} key={genre.id} />
          })}
        </div>
        <div className="flex w-full justify-center py-4 md:w-1/2  md:justify-end">
          <div className="[&>*:nth-child(even)]:rounded-r-md [&>*:nth-child(even)]:border-l-0 [&>*:nth-child(odd)]:rounded-l-md">
            <FilterButton path={dayHRef} text="ce soir" activeTime={activeTime} period="day" />
            <FilterButton
              path={weekHRef}
              text="cette semaine"
              activeTime={activeTime}
              period="week"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function FilterButton({
  path,
  text,
  activeTime,
  period,
}: {
  path: string
  text: string
  activeTime: string | undefined
  period: string
}) {
  const router = useRouter()
  return (
    <Button
      className={`hover:bg-black[#E2B748] h-14 w-36  rounded-none border-2 border-black bg-[#FFDCA8] text-black hover:border-none hover:bg-[#ee2244bc] hover:text-white 
       ${activeTime === period && 'bg-[#ee2244bc] text-white'}
       `}
      onClick={() => router.push(path)}
    >
      {text}
    </Button>
  )
}

export default FilterSection
