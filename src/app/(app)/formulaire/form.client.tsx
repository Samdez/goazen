'use client'

import type { Category, Location } from '@/payload-types'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { createTsForm, createUniqueFieldSchema } from '@ts-react/form'
import { useRouter } from 'next/navigation'
import type { File } from 'payload'
import React from 'react'
import { PacmanLoader } from 'react-spinners'
import { z } from 'zod'
import { createEvent } from '../queries/create-event'
import { sendEmail } from '../queries/send-email'
import FormContainer from './FormContainer'
import { DatePicker } from './form-components/DatePicker'
import { InputFile } from './form-components/ImageInput'
import { LocationsCommand } from './form-components/LocationsCommand'
import MultipleSelector from './form-components/MultipleSelector'
import TextArea from './form-components/TextArea'
import TextField from './form-components/TextField'
import Radio from './form-components/Radio'

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
export const RegionSchema = z.object({
  region: z.enum(['pays basque', 'landes']).optional(),
})
const TextAreaSchema = createUniqueFieldSchema(z.string(), 'description')
const ImageInputSchema = createUniqueFieldSchema(z.custom<File>().brand('image'), 'image')
const mapping = [
  [z.string(), TextField],
  [LocationSchema, LocationsCommand],
  [DateSchema, DatePicker],
  [GenresSchema, MultipleSelector],
  [TextAreaSchema, TextArea],
  [ImageInputSchema, InputFile],
  [RegionSchema, Radio],
] as const
const MyForm = createTsForm(mapping, {
  FormComponent: FormContainer,
})
const createEventSchema = z
  .object({
    title: z.string().describe("Nom de l'event // Nom de l'event"),
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
    genres: GenresSchema.optional(),
    preciseGenre: z
      .string()
      .optional()
      .describe(
        'Genre musical précis // Genre musical précis (deep house, afro house, hardcore, etc... - optionnel)',
      ),
    price: z.string().optional().describe('Prix // Prix (0 si gratuit, optionnel)'),
    email: z.string().email().describe('Email // Email'),
    ticketingLink: z
      .string()
      .optional()
      .describe('Lien de la billetterie // Lien de la billetterie (optionnel)'),
  })
  .refine(
    (data) => {
      return (
        (data.location?.name && data.location.name !== '') ||
        (data.location_alt && data.location_alt !== '' && data.region !== undefined)
      )
    },
    {
      message:
        'Merci de choisir un lieu dans notre liste OU de renseigner le nom du lieu et sa région',
      path: ['region'],
    },
  )
export type CreateEventSchemaType = z.infer<typeof createEventSchema>

export default function FormClient({
  locations,
  categories,
}: {
  locations: Location[]
  categories: Category[]
}) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center w-full pb-8">
      <div className="flex flex-col gap-4 mb-6 p-2 px-6">
        <div className="flex flex-col gap-2"></div>
        <h1 className="text-2xl font-bold text-center">Ton event sur Goazen!</h1>
        <p className="font-text">
          Si tu souhaites voir ton évènement sur Goazen!, il te suffit de remplir ce formulaire. Une
          fois validé par notre équipe, ton évènement sera visible sur ce site et dans notre agenda
          Instagram.
        </p>
        <p className="font-text md:text-center">
          Pour nous envoyer un mail c&apos;est{' '}
          <a href="mailto:goazen.info@gmail.com" className="underline">
            ici
          </a>
          <> !</>
        </p>
      </div>
      <div className="w-full lg:w-2/3 flex flex-col gap-6 px-6">
        <form
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
          <MyForm
            schema={createEventSchema}
            onSubmit={async (formData) => {
              try {
                setIsLoading(true)
                const res = await createEvent(formData)
                if (!res?.ok) {
                  toast({
                    variant: 'destructive',
                    description: "Erreur lors de l'envoi de l'évènement",
                  })
                  return
                }

                await sendEmail({
                  ...formData,
                })
                toast({
                  description: 'Event bien envoyé!',
                })
                router.push('/')
              } catch (error) {
                console.error('Submit error:', error)
                toast({
                  variant: 'destructive',
                  description: "Erreur lors de l'envoi de l'évènement",
                })
              } finally {
                setIsLoading(false)
              }
            }}
            props={{
              location: { locations },
              genres: {
                defaultOptions: categories.map((category) => ({
                  label: category.name,
                  value: category.id,
                })),
                placeholder: 'Genres musicaux',
              },
              region: {
                options: ['pays basque', 'landes'],
              },
            }}
            renderAfter={({ submit }) =>
              isLoading ? (
                <div className="flex justify-center items-center w-full">
                  <PacmanLoader color="#000" size={20} />
                </div>
              ) : (
                <Button onClick={submit} type="button">
                  Envoyer
                </Button>
              )
            }
          />
        </form>
      </div>
    </div>
  )
}
