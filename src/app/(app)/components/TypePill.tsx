import { cn } from '@/lib/utils'
import { bebas } from '../fonts'

type Size = 'sm' | 'md'

export function TypePill({
  children,
  size = 'md',
  className,
}: {
  children: React.ReactNode
  size?: Size
  className?: string
}) {
  return (
    <span
      className={cn(
        bebas.className,
        'inline-block whitespace-nowrap rounded-full border-brand border-brand-ink bg-brand-paper uppercase tracking-wider text-brand-ink',
        size === 'sm' ? 'px-2 py-[3px] text-[10px]' : 'px-3 py-[5px] text-[11px]',
        className,
      )}
    >
      {children}
    </span>
  )
}
