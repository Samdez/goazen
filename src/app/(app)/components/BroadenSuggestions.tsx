import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { bebas, darkerGrotesque } from '../fonts'

export interface ActiveFilter {
  /** Key shown in URL (`when`, `region`, etc.) */
  paramKey: 'genres' | 'city' | 'free' | 'region' | 'when'
  /** Human label for the chip being dropped */
  label: string
  /** URL the user lands on when they drop this filter */
  href: string
}

/**
 * Empty-state shown when filters compose to zero. Offers one-tap removal of
 * each active filter, ordered by which is most likely too restrictive
 * (genres → city → free → region → time). See ADR-?? / CONTEXT.md.
 */
export default function BroadenSuggestions({
  active,
  clearAllHref,
}: {
  active: ActiveFilter[]
  clearAllHref: string
}) {
  const ordered = [...active].sort(
    (a, b) => RANK.indexOf(a.paramKey) - RANK.indexOf(b.paramKey),
  )

  return (
    <div className="flex flex-col items-center gap-5 rounded-brand border-brand border-brand-ink bg-brand-paper px-6 py-12 text-center shadow-brand">
      <Image
        src="/GOAZEN_MASCOTTES.png"
        alt=""
        width={140}
        height={140}
        className="h-auto w-28 opacity-90"
        unoptimized
      />
      <p className={cn(bebas.className, 'text-[24px] uppercase tracking-tight')}>
        Aucun événement avec ces filtres
      </p>

      {ordered.length > 0 && (
        <div className="flex w-full max-w-[480px] flex-col gap-2">
          <p className={cn(darkerGrotesque.className, 'text-sm text-brand-muted')}>
            Essaie sans :
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {ordered.map((f) => (
              <Link
                key={`${f.paramKey}-${f.label}`}
                href={f.href}
                className={cn(
                  bebas.className,
                  'shrink-0 rounded-full border-brand border-brand-ink bg-brand-paper px-4 py-2 text-[13px] font-bold uppercase tracking-wide hover:bg-brand-cream-soft',
                )}
              >
                ✕ {f.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <Link
        href={clearAllHref}
        className={cn(
          bebas.className,
          'mt-2 text-sm uppercase tracking-wide text-brand-orange hover:text-brand-orange-hover',
        )}
      >
        Effacer tous les filtres →
      </Link>
    </div>
  )
}

const RANK: ActiveFilter['paramKey'][] = ['genres', 'city', 'free', 'region', 'when']
