import { isAdminOrHasLocationAccess } from '@/app/(payload)/access/isAdminOrHasLocationAccess'
import { isAdminFieldLevel } from '@/app/(payload)/access/isAdmin'
import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'
import { ValidationError } from 'payload'
import { slugifyString } from '../utils'
import { revalidateCacheTag } from '@/lib/revalidate-cache'
import {
  bannerOverlapQueryBounds,
  bannerWindowFieldError,
  formatDayFR,
} from '@/lib/banner-window'

// Banner windows may never overlap: the home has a single "bon plan" slot,
// so at most one window covers any given day (ADR-0004). Blocking here at
// save time keeps the home query trivially deterministic.
const validateBannerWindow: CollectionBeforeValidateHook = async ({ data, originalDoc, req }) => {
  if (!data) return data
  // PATCH payloads may omit unchanged fields — fall back to the stored doc,
  // but respect explicit nulls (field cleared).
  const merged = (key: 'banner_start_date' | 'banner_end_date'): Date | null => {
    const raw = key in data ? data[key] : originalDoc?.[key]
    return raw ? new Date(raw) : null
  }
  const start = merged('banner_start_date')
  const end = merged('banner_end_date')

  const fieldError = bannerWindowFieldError(start, end)
  if (fieldError) {
    throw new ValidationError({
      collection: 'special-events',
      errors: [{ path: 'banner_end_date', message: fieldError }],
    })
  }
  if (!start || !end) return data

  const { startBefore, endOnOrAfter } = bannerOverlapQueryBounds(start, end)
  const conflict = await req.payload.find({
    collection: 'special-events',
    where: {
      and: [
        ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
        { banner_start_date: { less_than: startBefore.toISOString() } },
        { banner_end_date: { greater_than_equal: endOnOrAfter.toISOString() } },
      ],
    },
    limit: 1,
    depth: 0,
    req,
  })
  const other = conflict.docs[0]
  if (other) {
    const range =
      other.banner_start_date && other.banner_end_date
        ? ` (${formatDayFR(new Date(other.banner_start_date))} → ${formatDayFR(new Date(other.banner_end_date))})`
        : ''
    throw new ValidationError({
      collection: 'special-events',
      errors: [
        {
          path: 'banner_start_date',
          message: `La fenêtre de bannière chevauche celle de « ${other.name} »${range}. Une seule bannière à la fois sur la home.`,
        },
      ],
    })
  }
  return data
}

const SpecialEvents: CollectionConfig = {
  slug: 'special-events',
  trash: true,
  access: {
    read: isAdminOrHasLocationAccess('id'),
    update: isAdminOrHasLocationAccess('id'),
    delete: isAdminOrHasLocationAccess('id'),
    create: isAdminOrHasLocationAccess('id'),
  },
  hooks: {
    beforeValidate: [validateBannerWindow],
    afterChange: [
      async ({ doc }) => {
        await revalidateCacheTag('special-events')
        return doc
      },
    ],
    afterDelete: [async () => revalidateCacheTag('special-events')],
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
      name: 'banner_start_date',
      type: 'date',
      label: 'Bannière home : premier jour',
      access: { create: isAdminFieldLevel, update: isAdminFieldLevel },
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly' },
        description:
          'Premier jour d’affichage de la bannière « bon plan » en haut de la home. Laisser vide pour ne pas programmer de bannière.',
      },
    },
    {
      name: 'banner_end_date',
      type: 'date',
      label: 'Bannière home : dernier jour (inclus)',
      access: { create: isAdminFieldLevel, update: isAdminFieldLevel },
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly' },
        description:
          'La bannière reste affichée ce jour-là et disparaît le lendemain. Deux événements ne peuvent pas avoir des fenêtres de bannière qui se chevauchent.',
      },
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'meta_description',
      type: 'textarea',
      label: 'Description SEO (Google)',
      maxLength: 200,
      admin: {
        description:
          'Texte du snippet Google (~155 caractères). Si vide, déduit de la description.',
      },
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
      label: 'Image (bannière desktop)',
      admin: {
        position: 'sidebar',
        description: 'Image large pour la bannière sur grand écran (~2400×280, ratio ~8:1).',
      },
    },
    {
      name: 'image_mobile',
      type: 'upload',
      relationTo: 'medias',
      label: 'Image (bannière mobile)',
      admin: {
        position: 'sidebar',
        description:
          'Cadrage resserré pour mobile (~800×320, ratio ~2.5:1). Si vide, l’image desktop est utilisée.',
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
