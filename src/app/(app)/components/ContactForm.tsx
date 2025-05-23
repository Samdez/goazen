'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from '../../../components/ui/use-toast'
import { sendEmail } from '../queries/send-email'
import { darkerGrotesque } from '../fonts'
import { cn } from '@/utils'

const formSchema = z.object({
  email: z
    .string()
    .email({ message: 'Veuillez renseigner un email valide' })
    .min(1, { message: 'Veuillez renseigner un email valide' }),
  message: z.string().min(1, { message: 'Veuillez entrer un message' }),
})
export type FormSchema = z.infer<typeof formSchema>

function ContactForm() {
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  })

  async function onSubmit(data: any) {
    const res = await sendEmail(data)
    if (!res.ok) {
      toast({
        variant: 'destructive',
        description: "Erreur lors de l'envoi du message",
      })
      return
    }
    reset()
    toast({
      description: 'Message envoyé',
    })
  }

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit(data))}
      className={cn(darkerGrotesque.className, 'm-auto flex w-96 max-w-full flex-col')}
    >
      <input
        placeholder="Votre adresse mail"
        {...register('email')}
        className="mb-2 w-full rounded-sm p-1"
      />
      {errors.email?.message && <p className="text-red-500">{errors.email?.message.toString()}</p>}
      <textarea
        placeholder="Votre message"
        {...register('message')}
        className="mb-2 h-32 resize-none rounded-sm p-1"
      />
      {errors.message?.message && (
        <p className="rounded-md border-2 border-red-500 p-1 text-red-500">
          {errors.message?.message.toString()}
        </p>
      )}
      <input
        type="submit"
        className="rounded-md border-2 border-black hover:cursor-pointer hover:bg-black hover:text-white"
      />
    </form>
  )
}

export default ContactForm
