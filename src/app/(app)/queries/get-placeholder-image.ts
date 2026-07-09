'use server'
import { unstable_cache } from 'next/cache'
import { payload } from '../(client)/payload-client'

export async function getPlaceholderImage() {
  return unstable_cache(
    async () => {
      try {
        const placeholderImage = await payload.findGlobal({
          slug: 'image-placeholder',
        })
        if (
          !placeholderImage.ImagePlaceholder ||
          typeof placeholderImage.ImagePlaceholder === 'string' ||
          !placeholderImage.ImagePlaceholder.url
        ) {
          console.error('No placeholder image found')
          return
        }
        return placeholderImage.ImagePlaceholder.url
      } catch (error) {}
    },
    ['image-placeholder'],
    { tags: ['image-placeholder'], revalidate: 60 * 60 * 24 },
  )()
}
