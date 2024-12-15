'use server'

import { payload } from '../../payload-client'

export async function getPlaceholderImage() {
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
}
