import { CollectionConfig } from 'payload'
import { slugifyString } from '../utils'
import { isAdmin } from '@/app/(payload)/access/isAdmin'

const Cities: CollectionConfig = {
  slug: 'cities',
  access: {
    read: isAdmin,
  },
  admin: { useAsTitle: 'name' },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
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

export default Cities
