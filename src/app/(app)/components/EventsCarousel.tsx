'use client'

import { Event } from '@/payload-types'
import EventCard from './EventCard'
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
    <Carousel className="py-8 md:w-1/2 w-full">
      <CarouselContent>
        {events.map((event) => {
          return (
            <CarouselItem key={event.id} className="md:basis-1/2">
              <EventCard event={event} placeholderImageUrl={placeholderImageUrl} />
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
