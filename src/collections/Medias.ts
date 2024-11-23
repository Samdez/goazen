import { CollectionConfig } from 'payload'

const Medias: CollectionConfig = {
  slug: 'medias',
  access: {
    read: () => true,
  },
  upload: {
    // staticURL: "/media",
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
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
  ],
}

export default Medias
