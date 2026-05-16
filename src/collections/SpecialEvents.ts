import { isAdminOrHasLocationAccess } from '@/app/(payload)/access/isAdminOrHasLocationAccess'
import type { CollectionConfig } from 'payload'
import { slugifyString } from '../utils'

const SpecialEvents: CollectionConfig = {
  slug: 'special-events',
  access: {
    read: isAdminOrHasLocationAccess('id'),
    update: isAdminOrHasLocationAccess('id'),
    delete: isAdminOrHasLocationAccess('id'),
    create: isAdminOrHasLocationAccess('id'),
  },
  admin: { useAsTitle: 'name' },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'subtitle',
      type: 'text',
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Mettre en avant sur la home',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description:
          'Affiche cet événement en bannière sur la home, si la date du jour est dans la fenêtre.',
      },
    },
    {
      name: 'start_date',
      type: 'date',
      label: 'Date de début',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'end_date',
      type: 'date',
      label: 'Date de fin',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'place_id',
      label: 'place id',
      type: 'text',
    },
    {
      name: 'city V2',
      type: 'relationship',
      relationTo: 'cities',
      hasMany: false,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'medias',
      admin: {
        position: 'sidebar',
      },
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
      name: 'events',
      type: 'join',
      collection: 'events',
      on: 'special_event',
    },
    // {
    //   name: 'selected_events',
    //   type: 'join',
    //   collection: 'events',
    //   on: 'special_event',
    //   where: {
    //     special_event: {
    //       equals: '{{id}}',
    //     },
    //   },
    // },
  ],
}

export default SpecialEvents
