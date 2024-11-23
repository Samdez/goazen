import { GlobalConfig } from 'payload'

export const ImagePlaceholder: GlobalConfig = {
  access: {
    read: () => true,
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
