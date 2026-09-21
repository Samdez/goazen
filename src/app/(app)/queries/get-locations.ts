'use server'
import { unstable_cache } from 'next/cache'
import type { Location } from '@/payload-types'
import { slugifyString } from '@/utils'
import { payload } from '../(client)/payload-client'

type GetLocationsParams = {
  cityName?: string
  page?: number
  limit?: number
}

export type LocationOption = {
  id: string
  name: string
}

async function _getLocations({ cityName, page = 1, limit = 100 }: GetLocationsParams) {
  const locations = await payload.find({
    collection: 'locations',
    sort: 'name',
    limit,
    where: cityName ? { 'city V2.slug': { equals: slugifyString(cityName) } } : {},
    page,
  })
  return locations
}

export async function getLocations(params: GetLocationsParams) {
  const cacheKey = JSON.stringify({
    cityName: params.cityName || '',
    page: params.page || 1,
    limit: params.limit || 100,
  })

  return unstable_cache(async () => await _getLocations(params), ['locations', cacheKey], {
    tags: ['locations'],
    revalidate: 60 * 60 * 24, // 24 hours
  })()
}

// Slim variant for the event submission form: the full docs at limit 1000
// exceed unstable_cache's 2MB entry limit.
export async function getLocationOptions(): Promise<LocationOption[]> {
  return unstable_cache(
    async () => {
      const locations = await payload.find({
        collection: 'locations',
        sort: 'name',
        limit: 1000,
        depth: 0,
        select: { name: true },
      })
      return locations.docs.map(({ id, name }) => ({ id, name }))
    },
    ['location-options'],
    {
      tags: ['locations'],
      revalidate: 60 * 60 * 24, // 24 hours
    },
  )()
}

// Slim variant for the sitemap, same 2MB constraint as above.
export async function getLocationsForSitemap() {
  return unstable_cache(
    async () => {
      const locations = await payload.find({
        collection: 'locations',
        limit: 1000,
        depth: 1,
        select: { slug: true, updatedAt: true, 'city V2': true },
      })
      return locations.docs
    },
    ['locations-sitemap'],
    {
      tags: ['locations'],
      revalidate: 60 * 60 * 24, // 24 hours
    },
  )()
}

/** Ce qu'une carte de salle affiche, et rien de plus. */
export type LocationCardDoc = {
  id: string
  name: string
  slug?: string | null
  /** `city V2.slug` si la relation existe, sinon l'enum `city` legacy. */
  citySlug?: string | null
  region?: string
  imageUrl?: string
}

// `select` renvoie un doc partiel : on ne lit que les champs demandés.
type SelectedLocation = Pick<Location, 'id' | 'name' | 'slug' | 'city' | 'city V2' | 'image'>

function toLocationCard(location: SelectedLocation): LocationCardDoc {
  const cityDoc = typeof location['city V2'] === 'object' ? location['city V2'] : null
  const media = typeof location.image === 'object' ? location.image : null
  return {
    id: location.id,
    name: location.name,
    slug: location.slug,
    citySlug: cityDoc?.slug ?? location.city ?? null,
    region: cityDoc?.region ?? undefined,
    imageUrl: media?.sizes?.card?.url ?? media?.url ?? undefined,
  }
}

/**
 * Variante légère pour /salles-de-concert.
 *
 * `getLocations` renvoie les docs complets : les deux descriptions Lexical de
 * chaque salle, plus toutes les variantes de son image, finissaient dans le
 * payload RSC de la page — 2,1 Mo, assez pour qu'un crawler la tronque. On ne
 * transmet au client que les six champs qu'une carte affiche.
 */
export async function getLocationCards(
  params: GetLocationsParams,
): Promise<{
  docs: LocationCardDoc[]
  hasNextPage: boolean
  nextPage?: number | null
}> {
  const { cityName, page = 1, limit = 100 } = params
  const cacheKey = JSON.stringify({ cityName: cityName || '', page, limit })

  return unstable_cache(
    async () => {
      const locations = await payload.find({
        collection: 'locations',
        sort: 'name',
        where: cityName ? { 'city V2.slug': { equals: slugifyString(cityName) } } : {},
        page,
        limit,
        depth: 1,
        select: { name: true, slug: true, city: true, 'city V2': true, image: true },
      })
      return {
        docs: locations.docs.map(toLocationCard),
        hasNextPage: locations.hasNextPage,
        nextPage: locations.nextPage,
      }
    },
    ['location-cards', cacheKey],
    {
      tags: ['locations'],
      revalidate: 60 * 60 * 24, // 24 hours
    },
  )()
}
