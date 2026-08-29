import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPage, getPagesForSitemap } from '@/app/(app)/queries/get-page'
import { getPageEvents } from '@/app/(app)/queries/get-page-events'
import { RichTextWrapper } from '@/app/(app)/components/RichTextWrapper'
import RowEvent from '@/app/(app)/components/RowEvent'
import { bebas } from '@/app/(app)/fonts'
import { cn, lexicalToPlainText } from '@/utils'

// ISR: re-render periodically so the "upcoming events" section (new Date())
// isn't frozen at build time.
export const revalidate = 300

export async function generateStaticParams() {
  const pages = await getPagesForSitemap()
  return pages.map((page) => ({ slug: page.slug as string })).filter((p) => p.slug)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = await getPage(slug)

  if (!page || !page.published) {
    return {
      title: 'Page introuvable | Goazen!',
      description: "La page que vous recherchez n'existe pas.",
      robots: { index: false, follow: false },
    }
  }

  const title = page.meta?.title?.trim() || `${page.title} | Goazen!`
  const description = (
    page.meta?.description?.trim() ||
    lexicalToPlainText(page.content) ||
    `${page.title} — concerts et soirées au Pays Basque et dans les Landes.`
  ).slice(0, 155)
  const canonical = `https://goazen.info/pages/${slug}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Goazen!',
      locale: 'fr_FR',
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export default async function LandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await getPage(slug)

  if (!page || !page.published) {
    notFound()
  }

  const city = page.city && typeof page.city === 'object' ? page.city : null
  const genre = page.genre && typeof page.genre === 'object' ? page.genre : null

  const events =
    city || genre
      ? await getPageEvents({ cityId: city?.id, genreId: genre?.id })
      : []

  let agendaHeading: string | null = null
  if (city && genre) {
    agendaHeading = `Concerts & soirées ${genre.name} à venir à ${city.name}`
  } else if (city) {
    agendaHeading = `Concerts & soirées à venir à ${city.name}`
  } else if (genre) {
    agendaHeading = `Concerts & soirées ${genre.name} à venir`
  }

  return (
    <article className="mx-auto max-w-[75ch] px-6 py-12">
      <h1
        className={cn(
          bebas.className,
          'mb-6 text-[clamp(34px,5vw,56px)] uppercase leading-[1.05] tracking-tight text-brand-ink',
        )}
      >
        {page.title}
      </h1>
      {page.content && <RichTextWrapper data={page.content} />}

      {agendaHeading && (
        <section className="mt-14">
          <h2
            className={cn(
              bebas.className,
              'mb-6 text-[clamp(24px,3.5vw,36px)] uppercase leading-[1.1] tracking-tight text-brand-ink',
            )}
          >
            {agendaHeading}
          </h2>
          {events.length === 0 ? (
            <p className="text-brand-ink">Aucun concert à venir — revenez bientôt !</p>
          ) : (
            <div className="overflow-hidden rounded-brand border-brand border-brand-ink bg-brand-paper">
              {events.map((event) => (
                <RowEvent key={event.id} event={event} />
              ))}
            </div>
          )}
        </section>
      )}
    </article>
  )
}
