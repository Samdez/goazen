import type { CollectionConfig } from 'payload'
import { slugifyString } from '../utils'
import { isAdmin } from '@/app/(payload)/access/isAdmin'
import { revalidateCacheTag } from '@/lib/revalidate-cache'

// CMS-editable SEO landing pages. Created automatically by an external SEO
// pipeline and manually from the admin. Public read, admin write.
const Pages: CollectionConfig = {
  slug: 'pages',
  trash: true,
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [
      async ({ doc }) => {
        await revalidateCacheTag('pages')
        return doc
      },
    ],
    afterDelete: [async () => revalidateCacheTag('pages')],
  },
  admin: { useAsTitle: 'title' },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
    },
    {
      name: 'city',
      type: 'relationship',
      relationTo: 'cities',
      label: 'Ville',
    },
    {
      name: 'genre',
      type: 'relationship',
      relationTo: 'categories',
      label: 'Genre',
    },
    {
      name: 'published',
      type: 'checkbox',
      label: 'Publié',
      defaultValue: true,
      index: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      hooks: {
        beforeValidate: [
          ({ req: { payload }, data, operation }) => {
            // Auto-generate from the title ONLY on create when no slug was
            // provided. On update, a missing slug means "keep the existing one"
            // (otherwise every update would re-slug the doc from the title).
            if (payload && data && data.title && !data.slug && operation === 'create') {
              return slugifyString(data.title)
            }
          },
        ],
      },
    },
  ],
}

export default Pages
