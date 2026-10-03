import crypto from 'crypto'

/**
 * Compare l'en-tête `Authorization` à `Bearer <secret>` en temps constant.
 * Refuse tout quand le secret n'est pas configuré : une route protégée ne doit
 * jamais redevenir publique parce qu'une variable d'environnement manque.
 */
export function hasBearerSecret(authorization: string | null, secret: string | undefined) {
  if (!secret) return false
  // Hacher les deux côtés donne des buffers de même longueur pour timingSafeEqual.
  const hash = (value: string) => crypto.createHash('sha256').update(value).digest()
  return crypto.timingSafeEqual(hash(authorization ?? ''), hash(`Bearer ${secret}`))
}
