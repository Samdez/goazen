'use client'

import { Event } from '@/payload-types'
import EventThumbnail from './EventThumbnail'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

function EventsCarousel({
  events,
  placeholderImageUrl,
}: {
  events: Event[]
  placeholderImageUrl: string
}) {
  return (
    <Carousel className="w-[min(100%,1280px)] py-16">
      <CarouselContent>
        {events.map((event) => {
          return (
            <CarouselItem key={event.id} className="md:basis-1/3">
              <EventThumbnail event={event} placeholderImageUrl={placeholderImageUrl} />
            </CarouselItem>
          )
        })}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}

export default EventsCarousel
