import { createUniqueFieldSchema } from '@ts-react/form'
import type { File } from 'payload'
import { z } from 'zod'
import { EventKindSchema } from './event-kind-schema'

export const LocationSchema = z.object({
  name: z.string(),
  id: z.string().optional(),
})

export const DateSchema = z.object({
  date: z.date(),
})

/** Branded array so @ts-react/form maps to MultipleSelector; errors attach to `genres` (not nested paths). */
export const GenresListSchema = createUniqueFieldSchema(
  z.array(z.string()).min(1, 'Sélectionne au moins un genre musical'),
  'genres',
)

export const RegionSchema = z.object({
  region: z.enum(['pays basque', 'landes']).optional(),
})

export const TextAreaSchema = createUniqueFieldSchema(z.string(), 'description')
export const ImageInputSchema = createUniqueFieldSchema(z.custom<File>().brand('image'), 'image')
export const PriceSchema = createUniqueFieldSchema(z.string().min(1).max(20), 'price')

/** Champs communs à tous les schémas (sans cguAccepted). */
const baseEventFields = {
  title: z.string().describe("Nom de l'event // Nom de l'event"),
  event_kind: EventKindSchema.describe(
    "Type d'événement // Set DJ, live show, ou autre type d'événement",
  ),
  description: TextAreaSchema.optional().describe(
    "Description // Description de l'event ou line-up (optionnel)",
  ),
  image: ImageInputSchema.optional().describe("Image (optionnel - 20mb max) // Image de l'event"),
  location: LocationSchema.optional(),
  location_alt: z
    .string()
    .optional()
    .describe('Lieu alternatif // Tu ne trouves pas ton lieu dans la liste? Renseigne-le ici '),
  region: RegionSchema.optional(),
  date: DateSchema,
  time: z.string().optional().describe("Heure // Heure de l'event"),
  genres: GenresListSchema.describe('Genres musicaux // Sélectionne au moins un genre'),
  preciseGenre: z
    .string()
    .optional()
    .describe(
      'Genre musical précis // Genre musical précis (deep house, afro house, hardcore, etc... - optionnel)',
    ),
  price: PriceSchema.describe('Prix // Prix (0 si gratuit, 20 caractères max)'),
  email: z.string().email().describe('Email // Email'),
  ticketingLink: z
    .string()
    .optional()
    .describe('Lien de la billetterie // Lien de la billetterie (optionnel)'),
}

const locationRefine = (data: {
  location?: { name?: string }
  location_alt?: string
  region?: unknown
}) =>
  (data.location?.name && data.location.name !== '') ||
  (data.location_alt && data.location_alt !== '' && data.region !== undefined)

const locationRefineConfig = {
  message: 'Merci de choisir un lieu dans notre liste OU de renseigner le nom du lieu et sa région',
  path: ['region'] as (string | number)[],
}

/**
 * Schéma utilisé par @ts-react/form dans le formulaire.
 * N'inclut PAS cguAccepted (géré séparément via useState + checkbox UI).
 */
export const formEventSchema = z
  .object(baseEventFields)
  .refine(locationRefine, locationRefineConfig)

/**
 * Schéma de validation complet (serveur + tests unitaires).
 * Inclut cguAccepted: z.literal(true) — la case DOIT être cochée.
 */
export const createEventSchema = z
  .object({ ...baseEventFields, cguAccepted: z.literal(true) })
  .refine(locationRefine, locationRefineConfig)

export type FormEventSchemaType = z.infer<typeof formEventSchema>
export type CreateEventSchemaType = z.infer<typeof createEventSchema>
