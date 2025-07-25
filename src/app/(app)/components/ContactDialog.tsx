'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import FormContainer from '../formulaire/FormContainer'
import { createTsForm, createUniqueFieldSchema } from '@ts-react/form'
import { z } from 'zod'
import TextField from '../formulaire/form-components/TextField'
import { useDescription, useTsController } from '@ts-react/form'
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
const contactFormSchema = z.object({
  name: z.string().min(1).describe('Nom // Nom'),
  email: z.string().email().describe('Email // Email'),
  phone: z.string().optional().describe('Téléphone (optionnel) // Téléphone (optionnel)'),
  message: TextAreaSchema.describe('Message // Message'),
})
const ContactForm = createTsForm(mapping, {
  FormComponent: FormContainer,
})

export function ContactDialog({ className }: { className?: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  async function onSubmit(data: z.infer<typeof contactFormSchema>) {
    setIsLoading(true)
    console.log(data)
    try {
      const res = await sendEmail(data)
      if (res.ok) {
        setIsLoading(false)
        setOpen(false)
        toast({
          description: 'Email envoyé avec succès',
        })
      } else {
        throw new Error('Failed to send email')
      }
    } catch (error) {
      setIsLoading(false)
      toast({
        variant: 'destructive',
        description: "Erreur lors de l'envoi de l'email",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          Discutons-en!
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] sm:h-[80vh] sm:max-h-[800px] flex flex-col">
        <DialogHeader className="px-6">
          <DialogTitle>Discutons-en!</DialogTitle>
          <DialogDescription className="font-text">
            Vous avez un projet ? Nous sommes là pour vous aider à le réaliser.
          </DialogDescription>
        </DialogHeader>
        <div className="w-full flex flex-col px-6 py-2 justify-center overflow-y-auto">
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
