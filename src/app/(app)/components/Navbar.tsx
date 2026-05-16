'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { CalendarDays, Menu, MusicIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { bebas, darkerGrotesque } from '../fonts'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const isPaysBasque = pathname.startsWith('/concerts/pays-basque')
  const isLandes = pathname.startsWith('/concerts/landes')

  return (
    <>
      <header className="sticky top-0 z-50 border-b-brand border-brand-ink bg-brand-cream">
        <div className="mx-auto flex h-20 max-w-[1280px] items-center gap-7 px-5 md:h-24 md:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-3.5 py-2">
            <Image
              src="/GOAZEN_MASCOTTES.png"
              alt="Goazen!"
              width={70}
              height={99}
              className="h-14 w-auto md:h-[88px]"
              unoptimized
              priority
            />
            <span
              className={cn(
                bebas.className,
                'text-[36px] leading-[0.85] tracking-tight text-brand-orange md:text-[44px]',
              )}
            >
              GOAZEN!
            </span>
          </Link>

          <nav className="hidden flex-1 justify-center gap-9 md:flex">
            <NavLink href="/concerts/pays-basque" active={isPaysBasque}>
              Pays Basque
            </NavLink>
            <NavLink href="/concerts/landes" active={isLandes}>
              Landes
            </NavLink>
          </nav>

          <div className="ml-auto hidden items-center gap-5 md:flex">
            <Link
              href="/salles-de-concert?city=biarritz"
              className={cn(
                darkerGrotesque.className,
                'flex items-center gap-1.5 text-sm font-semibold leading-tight text-brand-orange hover:text-brand-orange-hover',
              )}
            >
              <MusicIcon className="h-4 w-4" />
              Les salles
              <br className="hidden lg:inline" />
              de concert
            </Link>
            <Link
              href="/formulaire"
              className={cn(
                darkerGrotesque.className,
                'flex items-center gap-2 rounded-md border-brand border-brand-ink bg-brand-orange px-4 py-2.5 text-sm font-bold leading-tight text-brand-paper shadow-brand-sm transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-brand-orange-hover',
              )}
            >
              <CalendarDays className="h-4 w-4" />
              Partage
              <br className="hidden lg:inline" />
              ton event
            </Link>
            <Link
              href="/pro"
              className={cn(
                darkerGrotesque.className,
                'text-sm font-semibold text-brand-orange hover:text-brand-orange-hover',
              )}
            >
              Espace Pro
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="ml-auto rounded-md border-brand border-brand-ink bg-brand-paper p-2 shadow-brand-sm md:hidden"
            aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {isOpen && (
        <div
          className="fixed inset-x-0 bottom-0 top-[80px] z-[60] overflow-y-auto bg-brand-cream md:hidden"
          role="dialog"
          aria-modal="true"
        >
          <nav className="mx-auto flex max-w-[1280px] flex-col gap-1 px-5 py-4">
            <MobileLink href="/concerts/pays-basque" onClick={() => setIsOpen(false)}>
              Pays Basque
            </MobileLink>
            <MobileLink href="/concerts/landes" onClick={() => setIsOpen(false)}>
              Landes
            </MobileLink>
            <MobileLink href="/salles-de-concert?city=biarritz" onClick={() => setIsOpen(false)}>
              Les salles de concert
            </MobileLink>
            <MobileLink href="/formulaire" onClick={() => setIsOpen(false)} variant="primary">
              Partage ton event
            </MobileLink>
            <MobileLink href="/pro" onClick={() => setIsOpen(false)}>
              Espace Pro
            </MobileLink>
          </nav>
        </div>
      )}
    </>
  )
}

function NavLink({
  href,
  children,
  active,
}: {
  href: string
  children: React.ReactNode
  active?: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        bebas.className,
        'relative text-[18px] uppercase tracking-wide text-brand-ink hover:text-brand-orange',
      )}
    >
      {children}
      {active && (
        <span className="absolute -bottom-2 left-0 right-0 h-[3px] bg-brand-orange" aria-hidden />
      )}
    </Link>
  )
}

function MobileLink({
  href,
  onClick,
  children,
  variant,
}: {
  href: string
  onClick: () => void
  children: React.ReactNode
  variant?: 'primary'
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        bebas.className,
        'rounded-md border-brand border-brand-ink px-4 py-3 text-[18px] uppercase tracking-wide',
        variant === 'primary'
          ? 'bg-brand-orange text-brand-paper shadow-brand-sm'
          : 'bg-brand-paper text-brand-ink',
      )}
    >
      {children}
    </Link>
  )
}
