import { CollectionConfig } from 'payload'
import { slugifyString } from '../utils'

const Cities: CollectionConfig = {
  slug: 'cities',
  access: { read: () => true },
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
