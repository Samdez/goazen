import { GlobalConfig } from 'payload'
import { isAdmin } from '../(payload)/access/isAdmin'

export const ImagePlaceholder: GlobalConfig = {
  access: {
    read: isAdmin,
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
