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
        width: 310,
        height: 176,
        position: 'centre',
        name: 'card',
        formatOptions: { format: 'webp' },
      },
    ],
  },
  fields: [],
}

export default Medias
