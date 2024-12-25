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
  return <div className="flex flex-col gap-4">{children}</div>
}
