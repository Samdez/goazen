'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function UserHasPena({ penaId, eventId }: { penaId: number; eventId: number }) {
  const router = useRouter()
  useEffect(() => {
    router.push(`/lagunekin/${eventId}/penas/${penaId}`)
  }, [])
  return null
}
