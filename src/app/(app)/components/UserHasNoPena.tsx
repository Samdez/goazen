'use client'

import { Button } from '@/components/ui/button'
import { addUserToPena } from '../api/queries/supabase/add-user-to-pena'

export function UserHasNoPena({
  existingPenasNumber,
  penaId,
  userId,
  eventId,
}: {
  existingPenasNumber: number
  penaId: number
  userId: number
  eventId: string
}) {
  return (
    <>
      <div className="flex flex-col items-center justify-center gap-6">
        <p className="text-2xl font-bold">
          Il existe déjà {existingPenasNumber > 1 ? `${existingPenasNumber} penas` : '1 pena'} pour
          ce concert!
        </p>
        <Button
          className="w-64 h-16 text-2xl"
          onClick={() => addUserToPena(penaId, userId, eventId)}
        >
          Rejoindre une pena
        </Button>
      </div>
    </>
  )
}
