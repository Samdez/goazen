'use client'

import { cn } from '@/lib/utils'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo, useTransition } from 'react'
import { bebas } from '../fonts'
import { CITY_CHIPS } from '../constants'
import type { Category } from '@/payload-types'

/**
 * URL params:
 *   ?when=tonight|weekend|week
 *   ?region=pays-basque|landes
 *   ?city=<slug>          (only valid when region is set)
 *   ?genres=rock,techno   (comma-separated category slugs, OR semantics)
 *
 * Row 1 (sticky) — scope: time + region + city (cascade).
 * Row 2 (non-sticky) — taste: genre chips.
 */
export default function FilterBar({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const active = useMemo(() => {
    const when = searchParams.get('when') ?? ''
    const region = searchParams.get('region') ?? ''
    const city = searchParams.get('city') ?? ''
    const genresRaw = searchParams.get('genres') ?? ''
    const genres = new Set(genresRaw.split(',').filter(Boolean))
    return {
      when,
      region,
      city,
      genres,
    }
  }, [searchParams])

  const setParam = useCallback(
    (mutate: (next: URLSearchParams) => void) => {
      const next = new URLSearchParams(searchParams.toString())
      mutate(next)
      const qs = next.toString()
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
      })
    },
    [pathname, router, searchParams],
  )

  const toggleWhen = (value: 'tonight' | 'weekend' | 'week') =>
    setParam((p) => {
      if (active.when === value) p.delete('when')
      else p.set('when', value)
    })

  const toggleRegion = (value: 'pays-basque' | 'landes') =>
    setParam((p) => {
      if (active.region === value) {
        p.delete('region')
        p.delete('city')
      } else {
        p.set('region', value)
        const stillValid = CITY_CHIPS[value].some((c) => c.slug === active.city)
        if (!stillValid) p.delete('city')
      }
    })

  const toggleCity = (slug: string) =>
    setParam((p) => {
      if (active.city === slug) p.delete('city')
      else p.set('city', slug)
    })

  const toggleGenre = (slug: string) =>
    setParam((p) => {
      const next = new Set(active.genres)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      if (next.size === 0) p.delete('genres')
      else p.set('genres', Array.from(next).join(','))
    })

  const cityChips =
    active.region === 'pays-basque' || active.region === 'landes'
      ? CITY_CHIPS[active.region]
      : []

  return (
    <div
      className={cn('transition-opacity', isPending && 'opacity-70')}
      aria-busy={isPending}
    >
      <div className="sticky top-0 z-40 border-b-brand border-brand-ink bg-brand-cream md:top-24">
        {isPending && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[3px] animate-brand-pulse bg-brand-orange"
          />
        )}
        <div className="mx-auto flex max-w-[1280px] gap-2.5 overflow-x-auto whitespace-nowrap px-5 py-4 md:px-8">
          <Chip active={active.when === 'tonight'} onClick={() => toggleWhen('tonight')}>
            Ce soir
          </Chip>
          <Chip active={active.when === 'weekend'} onClick={() => toggleWhen('weekend')}>
            Ce week-end
          </Chip>
          <Chip active={active.when === 'week'} onClick={() => toggleWhen('week')}>
            Cette semaine
          </Chip>
          <Separator />
          <Chip
            active={active.region === 'pays-basque'}
            onClick={() => toggleRegion('pays-basque')}
          >
            Pays Basque
          </Chip>
          <Chip active={active.region === 'landes'} onClick={() => toggleRegion('landes')}>
            Landes
          </Chip>
          {cityChips.length > 0 && (
            <>
              <Separator />
              {cityChips.map((c) => (
                <Chip
                  key={c.slug}
                  active={active.city === c.slug}
                  onClick={() => toggleCity(c.slug)}
                  variant="sub"
                >
                  {c.label}
                </Chip>
              ))}
            </>
          )}
        </div>
      </div>

      {categories.length > 0 && (
        <div className="border-b-brand border-brand-ink bg-brand-paper">
          <div className="mx-auto flex max-w-[1280px] gap-2 overflow-x-auto whitespace-nowrap px-5 py-3 md:px-8">
            {categories.map((cat) => {
              const slug = cat.slug ?? ''
              if (!slug) return null
              return (
                <Chip
                  key={cat.id}
                  active={active.genres.has(slug)}
                  onClick={() => toggleGenre(slug)}
                  variant="taste"
                >
                  {cat.name}
                </Chip>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
  variant = 'scope',
}: {
  active?: boolean
  onClick: () => void
  children: React.ReactNode
  variant?: 'scope' | 'sub' | 'taste'
}) {
  const sizing =
    variant === 'taste' || variant === 'sub'
      ? 'px-3 py-1.5 text-[12px]'
      : 'px-4 py-2 text-[13px]'
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        bebas.className,
        'shrink-0 rounded-full border-brand border-brand-ink font-bold uppercase tracking-wide transition-colors',
        sizing,
        active
          ? 'bg-brand-orange text-brand-paper'
          : 'bg-brand-paper text-brand-ink hover:bg-brand-cream-soft',
      )}
    >
      {children}
    </button>
  )
}

function Separator() {
  return (
    <span
      aria-hidden
      className="mx-1 inline-block h-5 w-[2.5px] shrink-0 self-center bg-brand-ink"
    />
  )
}
