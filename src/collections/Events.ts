import { CollectionConfig } from 'payload'
import { slugifyString } from '../utils'
import { revalidateTag } from 'next/cache'

const Events: CollectionConfig = {
  slug: 'events',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'description',
      type: 'text',
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      index: true,
    },
    { name: 'time', type: 'text' },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'medias',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'location',
      type: 'relationship',
      relationTo: 'locations',
      admin: {
        condition: (data) => !data.location_alt,
      },
    },
    {
      name: 'location_alt',
      type: 'text',
      admin: {
        condition: (data) => !data.location,
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      index: true,
    },
    {
      name: 'genres',
      type: 'text',
    },
    { name: 'price', type: 'text' },
    { name: 'sold_out', type: 'checkbox', label: 'Sold out' },
    { name: 'ticketing_url', type: 'text' },
    {
      name: 'slug',
      type: 'text',
      hooks: {
        beforeValidate: [
          ({ req: { payload }, data }) => {
            if (payload) {
              return slugifyString(data?.title)
            }
          },
        ],
        afterChange: [
          () => {
            revalidateTag('events')
          },
        ],
      },
    },
  ],
}
export default Events
