'use client'

import { Button } from '@/components/ui/button'
import { createPena } from '../api/queries/supabase/create-pena'

export default function CreatePena({ userId, eventId }: { userId: number; eventId: number }) {
  return <Button onClick={() => createPena(userId, eventId)}>Créer une pena</Button>
}
