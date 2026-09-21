'use server'

import { unstable_cache } from 'next/cache'
import type { PaginatedDocs } from 'payload'
import type { City } from '@/payload-types'
import { payload } from '../(client)/payload-client'

/**
 * Une ville telle que la consomment les listes, le filtre et le sitemap.
 *
 * Volontairement partiel : les appelants injectent aussi une entrée sentinelle
 * « Toutes les villes » qui n'a ni slug ni région.
 */
export type CityOption = Pick<City, 'id' | 'name'> &
  Partial<Pick<City, 'slug' | 'region' | 'createdAt' | 'updatedAt'>>

/**
 * Aucun appelant n'affiche `rich text description` — seule `getCity` (au
 * singulier) s'en sert, sur la page ville. La renvoyer pour les ~40 villes
 * ajoutait 384 Ko de payload RSC à chaque page portant le filtre par ville.
 */
export async function getCities(region?: string): Promise<PaginatedDocs<CityOption>> {
  return unstable_cache(
    async () => {
      const cities = await payload.find({
        collection: 'cities',
        sort: 'name',
        limit: 100,
        where: { ...(region ? { region: { equals: region } } : {}) },
        depth: 0,
        select: { name: true, slug: true, region: true, updatedAt: true },
      })
      return cities as unknown as PaginatedDocs<CityOption>
    },
    ['cities', region || ''],
    { tags: ['cities'], revalidate: 60 * 60 * 24 },
  )()
}
