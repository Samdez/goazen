import { CollectionConfig } from 'payload'
import { slugifyString } from '../utils'
import { isAdmin } from '@/app/(payload)/access/isAdmin'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

const Cities: CollectionConfig = {
  slug: 'cities',
  access: {
    // read: isAdmin,
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
    {
      name: 'description',
      type: 'text',
    },
    {
      name: 'rich text description',
      type: 'richText',

      // editor: lexicalEditor({}),
    },
    {
      name: 'cities_related',
      type: 'relationship',
      relationTo: 'cities',
      hasMany: true,
    },
  ],
}

export default Cities
