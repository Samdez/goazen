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
      <div>
        Il existe déjà {existingPenasNumber > 1 ? `${existingPenasNumber} penas` : '1 pena'} pour ce
        concert!
      </div>
      <Button onClick={() => addUserToPena(penaId, userId, eventId)}>Rejoindre une pena</Button>
    </>
  )
}
