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
          ({ req: { payload }, data }) => {
            // Auto-generate from the title ONLY when no slug was provided
            // (explicit slugs from the admin or the agent API are kept as-is).
            if (payload && data && data.title && !data.slug) {
              return slugifyString(data.title)
            }
          },
        ],
      },
    },
  ],
}

export default Pages
