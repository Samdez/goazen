'use client'

import { useState } from 'react'
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
import { InputFile } from './form-components/ImageInput'
import { File } from 'payload'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { PacmanLoader } from 'react-spinners'
import { useRouter } from 'next/navigation'
import { sendEmail } from '../api/queries/payload/send-email'
import { createEvent } from '../api/queries/payload/create-event'

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
const ImageInputSchema = createUniqueFieldSchema(z.custom<File>().brand('image'), 'image')
const mapping = [
  [z.string(), TextField],
  [LocationSchema, LocationsCommand],
  [DateSchema, DatePicker],
  [GenresSchema, MultipleSelector],
  [TextAreaSchema, TextArea],
  [ImageInputSchema, InputFile],
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
    image: ImageInputSchema.optional().describe("Image (optionnel) // Image de l'event"),
    location: LocationSchema.optional(),
    location_alt: z
      .string()
      .optional()
      .describe('Lieu alternatif // Tu ne trouves pas ton lieu dans la liste? Renseigne-le ici '),
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
        (data.location_alt && data.location_alt !== '')
      )
    },
    {
      message: 'Le lieu doit être renseigné',
      path: ['location'],
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
      <div className="flex flex-col gap-4 mb-12 p-2">
        <h1 className="text-2xl font-bold text-center">Ton event sur Goazen!</h1>
        <p>
          Si tu souhaites voir ton évènement sur Goazen!, il te suffit de remplir ce formulaire. Une
          fois validé par notre équipe, ton évènement sera visible sur ce site et dans notre agenda
          Instagram.
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
                if (!res.ok) {
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
