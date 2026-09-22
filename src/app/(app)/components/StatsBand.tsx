import { cn } from '@/lib/utils'
import { darkerGrotesque } from '../fonts'

/**
 * La bande de chiffres : « Plus de 5 600 concerts référencés depuis 2024 · … ».
 *
 * Un chiffre concret en prose est ce qu'un moteur génératif cite ; « le plus
 * grand agenda de la région » sans chiffre ne l'est pas. Rendue côté serveur,
 * donc lisible par un crawler sans JS.
 */
export default function StatsBand({
  items,
  className,
}: {
  items: Array<string | null>
  className?: string
}) {
  const parts = items.filter((item): item is string => Boolean(item))
  if (!parts.length) return null

  return (
    <p
      className={cn(
        darkerGrotesque.className,
        'mx-auto max-w-[1280px] px-5 text-center text-lg text-brand-ink md:px-8 md:text-xl',
        className,
      )}
    >
      {parts.map((part, index) => (
        <span key={part}>
          {index > 0 && <span className="mx-2 text-brand-orange">·</span>}
          {part}
        </span>
      ))}
    </p>
  )
}
