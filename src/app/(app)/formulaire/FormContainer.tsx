import { Button } from '@/components/ui/button'
import { ReactNode } from 'react'

export default function FormContainer({
  onSubmit,
  children,
  loading,
}: {
  onSubmit: () => void
  children: ReactNode
  loading?: boolean
}) {
  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      {children}
      <Button className="mt-4 w-full" type="submit" disabled={loading}>
        Envoyer
      </Button>
    </form>
  )
}
