'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import FormContainer from '../formulaire/FormContainer'
import {
  createTsForm,
  createUniqueFieldSchema,
  useDescription,
  useTsController,
} from '@ts-react/form'
import { z } from 'zod'
import TextField from '../formulaire/form-components/TextField'
import { PacmanLoader } from 'react-spinners'
import { useState } from 'react'
import { sendEmail } from '../queries/send-email'
import { useToast } from '@/components/ui/use-toast'

const ContactTextArea = () => {
  const { field, error } = useTsController<string>()
  const { label, placeholder } = useDescription()
  return (
    <>
      <Textarea
        value={field.value ? field.value : ''}
        onChange={(e) => {
          field.onChange(e.target.value)
        }}
        name={label}
        placeholder={placeholder}
        className="min-h-[200px] sm:min-h-[360px] resize-none"
      />
      {error?.errorMessage && <span className="text-red-500">{error?.errorMessage}</span>}
    </>
  )
}

const TextAreaSchema = createUniqueFieldSchema(z.string(), 'message')
const mapping = [
  [z.string(), TextField],
  [TextAreaSchema, ContactTextArea],
] as const

export const contactFormSchema = z.object({
  name: z.string().min(1).describe('Nom // Nom'),
  email: z.string().email().describe('Email // Email'),
  phone: z.string().optional().describe('Téléphone (optionnel) // Téléphone (optionnel)'),
  message: TextAreaSchema.describe('Message // Message'),
})

const ContactForm = createTsForm(mapping, { FormComponent: FormContainer })

/**
 * Le formulaire de contact, sans son emballage.
 *
 * Extrait de `ContactDialog` pour que la page /contact et la modale de
 * l'espace pro partagent le même formulaire — et le même chemin d'envoi.
 */
export function ContactFormBlock({ onSuccess }: { onSuccess?: () => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  async function onSubmit(data: z.infer<typeof contactFormSchema>) {
    setIsLoading(true)
    try {
      const res = await sendEmail(data)
      if (!res.ok) throw new Error('Failed to send email')
      setIsLoading(false)
      onSuccess?.()
      toast({ description: 'Email envoyé avec succès' })
    } catch (error) {
      setIsLoading(false)
      toast({ variant: 'destructive', description: "Erreur lors de l'envoi de l'email" })
    }
  }

  return (
    <FormContainer>
      <ContactForm
        onSubmit={onSubmit}
        schema={contactFormSchema}
        renderAfter={({ submit }) =>
          isLoading ? (
            <div className="flex justify-center items-center w-full">
              <PacmanLoader color="#000" size={20} />
            </div>
          ) : (
            <div className="flex justify-center gap-4 w-full">
              <Button onClick={submit} type="button" disabled={isLoading}>
                Envoyer
              </Button>
            </div>
          )
        }
      >
        {({ name, email, phone, message }) => (
          <div className="flex flex-col gap-4">
            {name}
            {email}
            {phone}
            {message}
          </div>
        )}
      </ContactForm>
    </FormContainer>
  )
}
