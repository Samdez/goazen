'use client'

import { cn } from '@/lib/utils'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo, useTransition } from 'react'
import { bebas } from '../fonts'

/**
 * URL params used:
 *   ?when=tonight | weekend | week
 *   ?free=1
 *   ?region=pays-basque | landes
 */

export default function FilterBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const active = useMemo(() => {
    const when = searchParams.get('when') ?? ''
    const free = searchParams.get('free')
    const region = searchParams.get('region') ?? ''
    return {
      tonight: when === 'tonight',
      weekend: when === 'weekend',
      week: when === 'week',
      free: free === '1',
      paysBasque: region === 'pays-basque',
      landes: region === 'landes',
    }
  }, [searchParams])

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(searchParams.toString())
      if (value == null) next.delete(key)
      else next.set(key, value)
      const qs = next.toString()
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
      })
    },
    [pathname, router, searchParams],
  )

  const toggleWhen = (value: 'tonight' | 'weekend' | 'week') => {
    const current = searchParams.get('when')
    setParam('when', current === value ? null : value)
  }
  const toggleFree = () => {
    setParam('free', active.free ? null : '1')
  }
  const toggleRegion = (value: 'pays-basque' | 'landes') => {
    const current = searchParams.get('region')
    setParam('region', current === value ? null : value)
  }

  return (
    <div
      className={cn(
        'sticky top-0 z-40 border-b-brand border-brand-ink bg-brand-cream transition-opacity md:top-24',
        isPending && 'opacity-70',
      )}
      aria-busy={isPending}
    >
      {isPending && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[3px] animate-brand-pulse bg-brand-orange"
        />
      )}
      <div className="mx-auto flex max-w-[1280px] gap-2.5 overflow-x-auto whitespace-nowrap px-5 py-4 md:px-8">
        <Chip active={active.tonight} onClick={() => toggleWhen('tonight')}>
          Ce soir
        </Chip>
        <Chip active={active.weekend} onClick={() => toggleWhen('weekend')}>
          Ce week-end
        </Chip>
        <Chip active={active.week} onClick={() => toggleWhen('week')}>
          Cette semaine
        </Chip>
        <Chip active={active.free} onClick={toggleFree}>
          Gratuit
        </Chip>
        <Separator />
        <Chip active={active.paysBasque} onClick={() => toggleRegion('pays-basque')}>
          Pays Basque
        </Chip>
        <Chip active={active.landes} onClick={() => toggleRegion('landes')}>
          Landes
        </Chip>
      </div>
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        bebas.className,
        'shrink-0 rounded-full border-brand border-brand-ink px-4 py-2 text-[13px] font-bold uppercase tracking-wide transition-colors',
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
