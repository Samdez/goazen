import Link from 'next/link'
import { cn } from '@/lib/utils'
import { bebas, darkerGrotesque } from '../fonts'

export default function SectionTeaser({
  title,
  hint,
  href,
}: {
  title: string
  hint: string
  href?: string
}) {
  const body = (
    <div className="flex items-center justify-between gap-4 rounded-brand border-brand border-dashed border-brand-ink/40 bg-brand-paper/60 px-5 py-4">
      <div>
        <p className={cn(bebas.className, 'text-[18px] uppercase tracking-tight text-brand-ink')}>
          {title}
        </p>
        <p className={cn(darkerGrotesque.className, 'text-sm text-brand-muted')}>{hint}</p>
      </div>
      {href && (
        <span className={cn(bebas.className, 'text-sm uppercase text-brand-orange')}>↓</span>
      )}
    </div>
  )
  return href ? <Link href={href}>{body}</Link> : body
}
