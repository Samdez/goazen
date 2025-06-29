import { isAdmin } from '@/app/(payload)/access/isAdmin'
import { CollectionConfig } from 'payload'

const Medias: CollectionConfig = {
  slug: 'medias',
  access: {
    read: () => true,
    create: () => true,
    delete: isAdmin,
    update: isAdmin,
  },
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/*'],
    formatOptions: {
      format: 'webp',
    },
    imageSizes: [
      {
        name: 'thumbnail',
        width: 326,
        height: 215,
        position: 'centre',
        formatOptions: { format: 'webp' },
      },
      {
        name: 'card',
        width: 640,
        height: 360,
        position: 'centre',
        formatOptions: { format: 'webp' },
      },
      {
        name: 'eventCard',
        width: 640,
        height: 360,
        position: 'centre',
        formatOptions: { format: 'webp' },
      },
    ],
  },
  fields: [],
}

export default Medias
