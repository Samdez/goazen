'use server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function getPlaceholderImage() {
  try {
    const payload = await getPayload({ config })
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
