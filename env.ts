import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    RESEND_API_KEY: z.string(),
    GOAZEN_EMAIL_ADDRESS: z.string(),
    GOOGLE_MAPS_API_KEY: z.string(),
  },
  client: {},
  runtimeEnv: {
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    GOAZEN_EMAIL_ADDRESS: process.env.GOAZEN_EMAIL_ADDRESS,
  },
})
