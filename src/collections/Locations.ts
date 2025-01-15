import { CollectionConfig } from 'payload'
import { slugifyString } from '../utils'
import { isAdmin } from '@/app/(payload)/access/isAdmin'
import { isAdminOrHasLocationAccess } from '@/app/(payload)/access/isAdminOrHasLocationAccess'

const Locations: CollectionConfig = {
  slug: 'locations',
  access: {
    read: isAdminOrHasLocationAccess('id'),
    update: isAdminOrHasLocationAccess('id'),
  },
  admin: { useAsTitle: 'name' },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
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
      name: 'city',
      type: 'select',
      hasMany: false,
      // admin: { isClearable: true },
      options: [
        { label: 'Biarritz', value: slugifyString('biarritz') },
        { label: 'Bayonne', value: slugifyString('bayonne') },
        { label: 'Anglet', value: slugifyString('anglet') },
        { label: 'Capbreton', value: slugifyString('capbreton') },
        { label: 'Hossegor', value: slugifyString('hossegor') },
        { label: 'Seignosse', value: slugifyString('seignosse') },
        { label: 'Saint Jean de Luz', value: slugifyString('Saint Jean de Luz') },
        { label: 'Hendaye', value: slugifyString('hendaye') },
        { label: 'Bidart', value: slugifyString('bidart') },
        { label: 'Guethary', value: slugifyString('guethary') },
        { label: 'Angresse', value: slugifyString('angresse') },
        { label: 'Labenne', value: slugifyString('labenne') },
        { label: 'Soustons', value: slugifyString('soustons') },
      ],
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
  ],
}

export default Locations
