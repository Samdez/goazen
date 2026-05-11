import { cn } from '@/lib/utils'
import { bebas } from '../fonts'

export function PricePill({
  children,
  featured = false,
  withShadow = false,
  title,
  className,
}: {
  children: React.ReactNode
  featured?: boolean
  withShadow?: boolean
  /** Full text shown on hover when the visible label is truncated */
  title?: string
  className?: string
}) {
  return (
    <span
      title={title ?? (typeof children === 'string' ? children : undefined)}
      className={cn(
        bebas.className,
        'inline-block max-w-[180px] truncate rounded-full border-brand border-brand-ink px-3.5 py-[7px] text-sm font-bold tracking-wide',
        featured ? 'bg-brand-orange text-brand-paper' : 'bg-brand-paper text-brand-ink',
        withShadow && 'shadow-brand-sm',
        className,
      )}
    >
      {children}
    </span>
  )
}
