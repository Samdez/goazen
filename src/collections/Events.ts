import { isAdminOrHasLocationAccess } from '@/app/(payload)/access/isAdminOrHasLocationAccess'
import type { CollectionConfig } from 'payload'
import { slugifyString } from '../utils'

const Events: CollectionConfig = {
  slug: 'events',
  versions: { drafts: true },
  access: {
    read: isAdminOrHasLocationAccess('location.id'),
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
      filterOptions: ({ user }) => {
        if (user?.roles?.includes('admin')) return true
        return {
          id: {
            in: user?.locations?.map((loc) => (typeof loc === 'string' ? loc : loc.id)),
          },
        }
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
      name: 'region',
      type: 'select',
      options: ['pays-basque', 'landes'],
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
    { name: 'contact_email', type: 'text' },
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
          async ({ req }) => {
            try {
              await fetch(`${process.env.NEXT_PUBLIC_URL}/api/revalidate?tag=events`, {
                method: 'POST',
              })
            } catch (err) {
              console.error('Error revalidating:', err)
            }
          },
        ],
      },
    },
  ],
}
export default Events
