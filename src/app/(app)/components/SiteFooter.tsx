import Image from 'next/image'
import Link from 'next/link'
import { bebas, darkerGrotesque } from '../fonts'
import { cn } from '@/lib/utils'

export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t-brand border-brand-ink bg-brand-cream-soft pb-9 pt-14">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8">
        <div className="mb-10 grid gap-12 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <div className="mb-3 flex items-center gap-3.5">
              <Image
                src="/GOAZEN_MASCOTTES.png"
                alt="Goazen!"
                width={45}
                height={64}
                className="h-16 w-auto"
                unoptimized
              />
              <span
                className={cn(
                  bebas.className,
                  'text-[30px] leading-[0.85] tracking-tight text-brand-orange',
                )}
              >
                GOAZEN!
              </span>
            </div>
            <p className={cn(darkerGrotesque.className, 'max-w-[36ch] text-sm text-brand-muted')}>
              L&rsquo;agenda des concerts et soirées au Pays Basque et dans les Landes. Fait par des
              passionnés, gratuit pour tous.
            </p>
          </div>

          <FooterCol title="Découvrir">
            <li>
              <Link href="/concerts/pays-basque" className="hover:text-brand-orange">
                Pays Basque
              </Link>
            </li>
            <li>
              <Link href="/concerts/landes" className="hover:text-brand-orange">
                Landes
              </Link>
            </li>
            <li>
              <Link href="/salles-de-concert" className="hover:text-brand-orange">
                Salles de concert
              </Link>
            </li>
            <li>
              <Link href="/genres" className="hover:text-brand-orange">
                Genres
              </Link>
            </li>
          </FooterCol>

          <FooterCol title="Participer">
            <li>
              <Link href="/formulaire" className="hover:text-brand-orange">
                Partage ton event
              </Link>
            </li>
            <li>
              <Link href="/pro" className="hover:text-brand-orange">
                Espace Pro
              </Link>
            </li>
          </FooterCol>

          <FooterCol title="Suivre">
            <li>
              <a
                href="https://www.instagram.com/goazen.info/"
                target="_blank"
                rel="noopener"
                className="hover:text-brand-orange"
              >
                Instagram
              </a>
            </li>
            <li>
              <Link href="/contact" className="hover:text-brand-orange">
                Contact
              </Link>
            </li>
          </FooterCol>
        </div>

        <div
          className={cn(
            darkerGrotesque.className,
            'flex flex-col gap-2 border-t-brand border-brand-ink pt-6 text-[13px] text-brand-muted md:flex-row md:items-center md:justify-between',
          )}
        >
          <div>© {new Date().getFullYear()} Goazen!</div>
          <div className="flex gap-2">
            <Link href="/cgu" className="hover:text-brand-orange">
              CGU
            </Link>
            <span>·</span>
            <Link href="/confidentialite" className="hover:text-brand-orange">
              Confidentialité
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h5
        className={cn(bebas.className, 'mb-3.5 text-base uppercase tracking-wide text-brand-ink')}
      >
        {title}
      </h5>
      <ul className={cn(darkerGrotesque.className, 'space-y-2 text-sm text-brand-ink')}>
        {children}
      </ul>
    </div>
  )
}
