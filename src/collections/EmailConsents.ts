import { isAdmin } from '@/app/(payload)/access/isAdmin'
import type { CollectionConfig } from 'payload'

const EmailConsents: CollectionConfig = {
  slug: 'email-consents',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'consentedAt', 'events'],
    description: 'Emails des organisateurs ayant accepté les CGU (partage partenaires commerciaux)',
  },
  access: {
    create: isAdmin,
    read: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      admin: {
        description: "Adresse email de l'organisateur",
      },
    },
    {
      name: 'consentedAt',
      type: 'date',
      required: true,
      admin: {
        description: 'Date du premier consentement',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'events',
      type: 'relationship',
      relationTo: 'events',
      hasMany: true,
      admin: {
        description: 'Événements soumis par cet organisateur',
      },
    },
  ],
}

export default EmailConsents
