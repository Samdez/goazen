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
    <div className="grid grid-cols-1 md:grid-cols-3 px-12 md:px-32 gap-4 md:gap-24 pb-8">
      <div className="md:col-span-2 flex flex-col gap-4 justify-center">
        <FilterSectionText activeTime={activeTime} activeCategory={category} />
        <h2 className="font-text text-xl leading-none text-left">
          Retrouve tous les concerts, DJ sets, festivals et soirées près de chez toi
        </h2>
      </div>
      <div className="flex justify-center w-full">
        <div className="w-full flex justify-between ">
          <GenreFilterComboBox
            categories={[
              { id: 'all', name: 'Tous les genres', slug: 'all', updatedAt: '', createdAt: '' },
              ...categories.sort((a, b) => a.name.localeCompare(b.name)),
            ]}
          />
          <DateFilterComboBox days={['day', 'week']} />
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
