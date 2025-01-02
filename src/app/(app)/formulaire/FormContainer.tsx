import { Button } from '@/components/ui/button'
import { ReactNode } from 'react'

export default function FormContainer({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-4">{children}</div>
}
