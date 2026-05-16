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
    resizeOptions: {
      width: 1920,
      withoutEnlargement: true,
    },
    imageSizes: [
      {
        name: 'card',
        width: 640,
        height: 360,
        position: 'centre',
        formatOptions: { format: 'webp' },
      },
      {
        name: 'eventCard',
        width: 1280,
        height: 800,
        position: 'attention',
        formatOptions: { format: 'webp' },
      },
      {
        name: 'hero',
        width: 1920,
        height: 1200,
        position: 'attention',
        formatOptions: { format: 'webp' },
      },
    ],
  },
  fields: [],
}

export default Medias
