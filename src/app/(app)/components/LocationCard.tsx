import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Location } from '@/payload-types'

function LocationCard({
  location,
  isEven,
  placeholderImageUrl,
}: {
  location?: Location
  isEven: boolean
  placeholderImageUrl: string
}) {
  if (!location) return
  const locationCity = typeof location['city V2'] !== 'string' && location['city V2']?.slug
  const locationRegion = typeof location['city V2'] !== 'string' && location['city V2']?.region

  const imageUrl =
    !(typeof location.image === 'string') && location.image
      ? location.image.sizes?.card?.url || location.image?.url
      : placeholderImageUrl

  return (
    <>
      <Card
        className={cn(
          'mx-4 flex h-1/2 w-full min-w-[256px] flex-col items-center rounded-xl border-8 border-black shadow-[15px_15px_0px_0px_rgba(0,0,0)] md:mx-0 md:w-1/3',
          { 'mt-28': !isEven },
        )}
      >
        <Link
          href={`/concerts/${locationRegion}/${locationCity || location.city}/${location?.slug}`}
          className="w-full rounded-xl"
        >
          <CardHeader className="flex h-28 items-center justify-center border-b-4 border-black bg-[#E45110] p-2">
            <CardTitle className="text-balance text-center text-2xl md:text-4xl">
              {location.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-hidden">
            <Image
              alt={location.name}
              src={imageUrl || ''}
              width={640}
              height={360}
              className="h-[300px] w-full object-cover transition hover:scale-110"
              priority={true}
              unoptimized
            />
          </CardContent>
        </Link>
      </Card>
    </>
  )
}

export default LocationCard
