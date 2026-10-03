'use client'

import { useEffect, useState } from 'react'
import { isEventPast } from '@/utils'

/**
 * Masque, côté client, les dates passées d'une liste figée en cache.
 *
 * Les pages ISR ne sont plus régénérées avec le temps : une liste rendue il y a
 * plusieurs jours peut contenir des concerts terminés depuis. Le filtrage se
 * fait après le montage pour que le premier rendu client reste identique au
 * HTML du serveur (pas d'erreur d'hydratation).
 */
export function useUpcomingEvents<T extends { date: string }>(events: T[]) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted ? events.filter((event) => !isEventPast(event.date)) : events
}
