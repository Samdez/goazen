import { z } from 'zod'

export const EventKindSchema = z.object({
  event_kind: z.enum(['dj_set', 'live_show', 'other']),
})
