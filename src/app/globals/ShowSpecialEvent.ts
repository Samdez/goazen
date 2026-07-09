import { GlobalConfig } from 'payload'
import { isAdmin } from '../(payload)/access/isAdmin'
import { revalidateCacheTag } from '@/lib/revalidate-cache'

export const ShowSpecialEvent: GlobalConfig = {
  access: {
    read: isAdmin,
  },
  hooks: {
    afterChange: [
      async ({ doc }) => {
        await revalidateCacheTag('show-special-event')
        return doc
      },
    ],
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
