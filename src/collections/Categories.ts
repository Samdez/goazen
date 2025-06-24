import { CollectionConfig } from 'payload'
import { slugifyString } from '../utils'
import { isAdmin } from '@/app/(payload)/access/isAdmin'

const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
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
