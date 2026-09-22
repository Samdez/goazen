import { isAdminOrHasLocationAccess } from '@/app/(payload)/access/isAdminOrHasLocationAccess'
import { APIError, type CollectionConfig } from 'payload'
import { slugifyString } from '../utils'
import { REGIONS } from '@/app/(app)/constants'
import { clearOtherHighlightsOnSameDay } from './hooks/clear-other-highlights'
import { clearRegionWhenLocated } from './hooks/clear-region-when-located'
import { normalizeTicketingUrl } from '@/lib/ticketing-url'

const Events: CollectionConfig = {
  slug: 'events',
  trash: true,
  versions: { drafts: true },
  access: {
    read: isAdminOrHasLocationAccess('location.id'),
  },
  admin: {
    useAsTitle: 'title',
  },
  hooks: {
    beforeChange: [clearRegionWhenLocated, clearOtherHighlightsOnSameDay],
    afterDelete: [
      async () => {
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
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'event_kind',
      type: 'select',
      label: "Type d'événement",
      options: [
        { label: 'Set DJ', value: 'dj_set' },
        { label: 'Live show', value: 'live_show' },
        { label: 'Autre', value: 'other' },
      ],
      index: true,
    },
    {
      name: 'highlighted',
      type: 'checkbox',
      label: 'Tête d’affiche du jour',
      defaultValue: false,
      index: true,
      admin: {
        description:
          'Cocher pour faire de cet événement la tête d’affiche de sa journée sur la home. Cocher cette case décoche automatiquement tout autre événement déjà mis en avant le même jour (heure de Paris).',
      },
    },
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
        if (!user || user.roles?.includes('admin')) return true
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
      options: REGIONS,
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
    { name: 'special_event', type: 'relationship', relationTo: 'special-events' },
    {
      name: 'add_to_selection',
      type: 'checkbox',
      label: 'Ajouter à la sélection',
      admin: {
        condition: (data) => data.special_event,
      },
    },
    {
      name: 'ticketing_url',
      type: 'text',
      label: 'Lien billetterie',
      admin: {
        description:
          'URL complète de la billetterie. Laisser vide si la vente se fait sur place — une note en texte libre ici casse la donnée structurée envoyée à Google.',
      },
      // On nettoie à l'écriture plutôt qu'à la lecture : un `www.x.fr` saisi
      // sans schéma est complété une fois pour toutes en base. La valeur
      // irrécupérable est conservée telle quelle pour que `validate` puisse
      // l'expliquer, au lieu de disparaître sans un mot.
      hooks: {
        beforeValidate: [({ value }) => normalizeTicketingUrl(value) ?? value],
      },
      validate: (value: string | null | undefined) =>
        !value || normalizeTicketingUrl(value)
          ? true
          : 'Lien invalide : saisir une URL complète (https://…) ou laisser le champ vide.',
    },
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
          ({ req: { payload }, data }) => {
            const errors = {
              location_alt: 'Veuillez saisir le nom de la salle alternative',
              region: 'Veuillez sélectionner une région',
            }

            if (data && !data.location) {
              if (!data.location_alt) {
                throw new APIError(errors.location_alt, 400, {
                  field: 'location_alt',
                })
              }
              if (!data.region) {
                throw new APIError(errors.region, 400, {
                  field: 'region',
                })
              }
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
