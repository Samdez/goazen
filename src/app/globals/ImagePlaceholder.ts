import { GlobalConfig } from 'payload'
import { isAdmin } from '../(payload)/access/isAdmin'
import { revalidateCacheTag } from '@/lib/revalidate-cache'

export const ImagePlaceholder: GlobalConfig = {
  access: {
    read: isAdmin,
  },
  hooks: {
    afterChange: [
      async ({ doc }) => {
        await revalidateCacheTag('image-placeholder')
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'ImagePlaceholder',
      type: 'upload',
      relationTo: 'medias',
    },
  ],
  slug: 'image-placeholder',
}
