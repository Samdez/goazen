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
    // Les fichiers passent par /api/medias/file/* (proxy Payload → S3) : sans
    // cet en-tête, ni le CDN Vercel ni le navigateur ne les gardaient, et chaque
    // affichage d'image relançait une fonction (~20 % du CPU facturé).
    // Immuable sans risque : une nouvelle image est toujours un nouveau fichier,
    // jamais le remplacement d'un fichier existant sous le même nom.
    modifyResponseHeaders: ({ headers }) => {
      headers.set('Cache-Control', 'public, max-age=31536000, immutable')
      return headers
    },
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
