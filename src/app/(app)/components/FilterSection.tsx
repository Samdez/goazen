'use client'

import { Button } from '@/components/ui/button'
import { Category } from '@/payload-types'
import FilterSectionText from './FilterSectionText'
import { useRouter } from 'next/navigation'
import { createHref } from '@/utils'
import { useCategory } from '../hooks/useGenre'
import { GenreFilterComboBox } from './GenreFilterComboBox'
import { DateFilterComboBox } from './DateFilterComboBox'

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
    <div className="pb-8 md:px-32 md:flex w-full justify-evenly">
      <div className="flex flex-col justify-center px-2">
        <FilterSectionText activeTime={activeTime} activeCategory={category} />
        <h2 className="font-text md:pl-8 text-lg leading-none text-center md:text-left">
          Retrouve tous les concerts, DJ sets, festivals et soirées près de chez toi
        </h2>
      </div>
      <div className="flex gap-2 justify-center pt-4">
        <GenreFilterComboBox
          categories={[
            { id: 'all', name: 'Tous les genres', slug: 'all', updatedAt: '', createdAt: '' },
            ...categories.sort((a, b) => a.name.localeCompare(b.name)),
          ]}
        />
        <DateFilterComboBox days={['day', 'week']} />
      </div>
      {/* <div className="md:flex">
        <div className="flex w-full flex-wrap justify-evenly gap-1 py-4 md:w-1/2"></div>
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
      </div> */}
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
      className={`hover:bg-black[#E2B748] h-14 w-36  rounded-none border-2 border-black bg-[#FFF2DD] text-black hover:border-none hover:bg-[#ee2244bc] hover:text-white 
       ${activeTime === period && 'bg-[#ee2244bc] text-white'}
       `}
      onClick={() => router.push(path)}
    >
      {text}
    </Button>
  )
}

export default FilterSection
