import Link from 'next/link'
import type { JSX } from 'react'

export default function Listing({
  links,
  title,
  citySlug,
}: {
  links: { name: string; slug: string; id: string }[]
  title: string
  citySlug?: string
}) {
  return (
    <>
      <h2 className="text-2xl font-bold mb-4 text-black">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-4 px-12 pb-16">
        {links
          .reduce((acc, item, index) => {
            if (index % 5 === 0) {
              acc.push([])
            }
            acc[acc.length - 1].push(
              <li key={item.id}>
                {/* <Link href={`/concerts/${citySlug}/${item.slug}`}> */}
                <Link href={item.slug}>
                  <h3 className="text-lg font-bold hover:text-white transition-all text-black">
                    {item.name}
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
    </>
  )
}
