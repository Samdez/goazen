'use client'

import { Button } from '@/components/ui/button'
import { createPena } from '../api/queries/supabase/create-pena'
import CreatePenaGirlsAlert from './CreatePenaGirlsAlert'

export default function CreatePena({ userId, eventId }: { userId: number; eventId: number }) {
  return (
    <>
      <Button className="w-64 h-16 text-2xl" onClick={() => createPena({ userId, eventId })}>
        Créer une pena
      </Button>
      <CreatePenaGirlsAlert userId={userId} eventId={eventId} />
    </>
  )
}
