'use client'

import type { Category, Location } from '@/payload-types'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { createTsForm } from '@ts-react/form'
import { useRouter } from 'next/navigation'
import React from 'react'
import { PacmanLoader } from 'react-spinners'
import { z } from 'zod'
import { createEvent } from '../queries/create-event'
import { sendEmail } from '../queries/send-email'
import {
  formEventSchema,
  DateSchema,
  GenresListSchema,
  ImageInputSchema,
  LocationSchema,
  PriceSchema,
  RegionSchema,
  TextAreaSchema,
} from './create-event-form-schema'
import FormContainer from './FormContainer'
import { DatePicker } from './form-components/DatePicker'
import { InputFile } from './form-components/ImageInput'
import { LocationsCommand } from './form-components/LocationsCommand'
import MultipleSelector from './form-components/MultipleSelector'
import TextArea from './form-components/TextArea'
import TextField from './form-components/TextField'
import Radio from './form-components/Radio'
import EventKindRadio from './form-components/EventKindRadio'
import PriceField from './form-components/PriceField'
import { EventKindSchema } from './event-kind-schema'

export {
  LocationSchema,
  DateSchema,
  RegionSchema,
  type CreateEventSchemaType,
} from './create-event-form-schema'

const mapping = [
  [z.string(), TextField],
  [LocationSchema, LocationsCommand],
  [DateSchema, DatePicker],
  [GenresListSchema, MultipleSelector],
  [TextAreaSchema, TextArea],
  [ImageInputSchema, InputFile],
  [RegionSchema, Radio],
  [EventKindSchema, EventKindRadio],
  [PriceSchema, PriceField],
] as const
const MyForm = createTsForm(mapping, {
  FormComponent: FormContainer,
})

export default function FormClient({
  locations,
  categories,
}: {
  locations: Location[]
  categories: Category[]
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [cguAccepted, setCguAccepted] = useState(false)
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

      {/* Bandeau modèle économique — style "données contre service" */}
      <div className="w-full lg:w-2/3 px-6 mb-6">
        <div className="rounded-lg border border-black/20 bg-black/5 p-4 flex flex-col gap-2">
          <p className="font-text">
            Si tu souhaites voir ton évènement sur Goazen!, il te suffit de remplir ce formulaire.
            Une fois validé par notre équipe, ton évènement sera visible sur ce site et dans notre
            agenda Instagram.
          </p>
          <p className="font-text">
            Pour nous envoyer un mail c&apos;est{' '}
            <a href="mailto:goazen.info@gmail.com" className="underline">
              ici
            </a>
            <> !</>
          </p>
          <p className="font-text text-sm">L&apos;agenda Goazen! est 100&nbsp;% gratuit.</p>
          <p className="text-sm font-text">
            En contrepartie, ton adresse email sera partagée avec nos partenaires commerciaux
            (billetteries, prestataires événementiels) qui pourront te contacter avec des offres
            liées à l&apos;organisation d&apos;événements.{' '}
          </p>
          <p className="text-sm font-text">
            En soumettant ce formulaire, tu acceptes ce fonctionnement tel que décrit dans nos{' '}
            <a href="/cgu" target="_blank" rel="noopener noreferrer" className="underline">
              CGU
            </a>
            .
          </p>
        </div>
      </div>
      <div className="w-full lg:w-2/3 flex flex-col gap-6 px-6">
        <form
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
          <MyForm
            schema={formEventSchema}
            defaultValues={{
              genres: [],
              price: '',
            }}
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
                <div className="flex flex-col gap-4 mt-2">
                  <label className="flex items-start gap-2 text-sm font-text cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cguAccepted}
                      onChange={(e) => setCguAccepted(e.target.checked)}
                      className="mt-0.5 shrink-0"
                    />
                    <span>
                      J&apos;ai lu et j&apos;accepte les{' '}
                      <a
                        href="/cgu"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        CGU
                      </a>
                    </span>
                  </label>
                  <Button onClick={submit} type="button" disabled={!cguAccepted}>
                    Envoyer
                  </Button>
                </div>
              )
            }
          />
        </form>
      </div>
    </div>
  )
}
