import { GlobalConfig } from 'payload'
import { isAdmin } from '../(payload)/access/isAdmin'

export const ShowSpecialEvent: GlobalConfig = {
  access: {
    read: isAdmin,
  },
  fields: [
    {
      name: 'show_special_event',
      type: 'checkbox',
    },
    {
      name: 'special_event',
      type: 'relationship',
      relationTo: 'special-events',
    },
  ],
  slug: 'show-special-event',
}
