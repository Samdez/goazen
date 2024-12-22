'use client'

import { useState } from 'react'
import { createEvent } from '../queries/create-event'
import { Category, Location } from '@/payload-types'

import React from 'react'
import { z } from 'zod'
import TextField from './form-components/TextField'
import { createTsForm, createUniqueFieldSchema } from '@ts-react/form'
import FormContainer from './FormContainer'
import { LocationsCommand } from './form-components/LocationsCommand'
import { DatePicker } from './form-components/DatePicker'
import MultipleSelector from './form-components/MultipleSelector'
import TextArea from './form-components/TextArea'

export const LocationSchema = z.object({
  name: z.string(),
  id: z.string().optional(),
})
export const DateSchema = z.object({
  date: z.date(),
})
export const GenresSchema = z.object({
  genres: z.string().array(),
})
const TextAreaSchema = createUniqueFieldSchema(z.string(), 'description')
const mapping = [
  [z.string(), TextField],
  [LocationSchema, LocationsCommand],
  [DateSchema, DatePicker],
  [GenresSchema, MultipleSelector],
  [TextAreaSchema, TextArea],
] as const
const MyForm = createTsForm(mapping, {
  FormComponent: FormContainer,
})
const createEventSchema = z.object({
  title: z.string().describe("Nom de l'event // Nom de l'event"),
  description: TextAreaSchema.optional().describe(
    "Description // Description de l'event ou line-up (optionnel)",
  ),
  location: LocationSchema,
  date: DateSchema,
  time: z.string().optional().describe("Heure // Heure de l'event"),
  genres: GenresSchema,
  preciseGenre: z
    .string()
    .optional()
    .describe('Genre musical précis // Genre musical précis (optionnel)'),
  price: z.string().optional().describe('Prix // Prix (0 si gratuit, optionnel)'),
  email: z.string().email().optional().describe('Email // Email (optionnel)'),
  ticketingLink: z
    .string()
    .optional()
    .describe('Lien de la billetterie // Lien de la billetterie (optionnel)'),
})
export type CreateEventSchemaType = z.infer<typeof createEventSchema>

export default function FormClient({
  locations,
  categories,
}: {
  locations: Location[]
  categories: Category[]
}) {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col gap-4 w-1/2 mb-12">
        <h1 className="text-2xl font-bold text-center">Ton event sur Goazen!</h1>
        <p>
          Si tu souhaites voir ton évènement sur Goazen!, il te suffit de remplir ce formulaire. Une
          fois validé par notre équipe, ton évènement sera visible sur ce site et dans notre agenda
          Instagram.
        </p>
      </div>
      <div className="w-1/4 flex flex-col gap-6">
        <MyForm
          schema={createEventSchema}
          onSubmit={createEvent}
          props={{
            location: { locations },
            // description: {
            //   placeholder: "Description de l'event ou line-up (optionnel)",
            // },
            genres: {
              defaultOptions: categories.map((category) => ({
                label: category.name,
                value: category.name,
              })),
              placeholder: 'Genres musicaux',
            },
          }}
        />
      </div>
    </div>
  )
}
