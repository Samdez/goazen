import { City, Location } from '@/payload-types'
import Link from 'next/link'
import { PaginatedDocs } from 'payload'
import { JSX } from 'react'

export default function RelatedLocationsAndCities({
  locations,
  regionParam,
  city,
  sectionTitle,
}: {
  locations: PaginatedDocs<Location> | PaginatedDocs<City>
  regionParam: string
  city: City
  sectionTitle: string
}) {
  function createHref(item: Location | City) {
    //item is a location
    if ('city V2' in item && typeof item['city V2'] !== 'string' && item['city V2']) {
      return `/concerts/${regionParam}/${item['city V2'].slug}/${item.slug}`
    }
    //item is a city
    return `/concerts/${regionParam}/${item.slug}`
  }
  return (
    <div className="flex flex-col gap-4 w-full">
      <h2 className="text-2xl text-black text-left font-text">{sectionTitle}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-4 pb-4">
        {locations.docs
          .reduce((acc, location, index) => {
            if (index % 5 === 0) {
              acc.push([])
            }
            acc[acc.length - 1].push(
              <li key={location.id}>
                <Link href={createHref(location)}>
                  <h3 className="text-lg font-bold hover:text-white transition-all font-text">
                    {location.name}
                  </h3>
                </Link>
              </li>,
            )
            return acc
          }, [] as JSX.Element[][])
          .map((column, colIndex) => (
            <ul key={colIndex} className="space-y-2">
              {column}
            </ul>
          ))}
      </div>
    </div>
  )
}
