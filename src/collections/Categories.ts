import { CollectionConfig } from 'payload'
import { slugifyString } from '../utils'
import { isAdmin } from '@/app/(payload)/access/isAdmin'
import { revalidateCacheTag } from '@/lib/revalidate-cache'

const Categories: CollectionConfig = {
  slug: 'categories',
  trash: true,
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [
      async ({ doc }) => {
        await revalidateCacheTag('categories')
        return doc
      },
    ],
    afterDelete: [async () => revalidateCacheTag('categories')],
  },
  admin: { useAsTitle: 'name' },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'slug',
      type: 'text',
      hooks: {
        beforeValidate: [
          ({ req: { payload }, data }) => {
            if (payload && data) {
              return slugifyString(data.name)
            }
          },
        ],
      },
    },
  ],
}

export default Categories
