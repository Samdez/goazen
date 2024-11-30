import { CollectionConfig } from 'payload'
import { slugifyString } from '../utils'

const Locations: CollectionConfig = {
  slug: 'locations',
  access: { read: () => true },
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
      name: 'city',
      type: 'select',
      hasMany: false,
      // admin: { isClearable: true },
      options: [
        { label: 'Biarritz', value: 'Biarritz' },
        { label: 'Bayonne', value: 'Bayonne' },
        { label: 'Anglet', value: 'Anglet' },
        { label: 'Capbreton', value: 'Capbreton' },
        { label: 'Hossegor', value: 'Hossegor' },
        { label: 'Seignosse', value: 'Seignosse' },
        { label: 'Saint Jean de Luz', value: 'Saint Jean de Luz' },
        { label: 'Hendaye', value: 'Hendaye' },
        { label: 'Bidart', value: 'Bidart' },
        { label: 'Guethary', value: 'Guethary' },
        { label: 'Angresse', value: 'Angresse' },
        { label: 'Labenne', value: 'Labenn' },
        { label: 'Soustons', value: 'Soustons' },
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
    { name: 'LocationEvents', type: 'join', collection: 'events', on: 'location' },
  ],
}

export default Locations
