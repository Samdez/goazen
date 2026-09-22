import type { Metadata } from 'next'
import Link from 'next/link'
import { ContactFormBlock } from '../components/ContactFormBlock'
import { JsonLd } from '../components/JsonLd'
import { organizationJsonLd, SITE_URL, OG_IMAGE } from '@/lib/structured-data'

const TITLE = 'Contact — Goazen!'
const DESCRIPTION =
  'Nous écrire : une date à ajouter à l’agenda, une correction sur un événement, une question. Par mail à contact@goazen.info, sur Instagram ou via le formulaire.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/contact`,
    siteName: 'Goazen!',
    images: [OG_IMAGE],
    locale: 'fr_FR',
    type: 'website',
  },
}

export default function ContactPage() {
  return (
    <>
      <JsonLd
        id="contact-structured-data"
        data={{
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: TITLE,
          url: `${SITE_URL}/contact`,
          inLanguage: 'fr-FR',
          mainEntity: organizationJsonLd(),
        }}
      />
      <div className="mx-auto max-w-2xl px-4 py-12 font-text text-lg [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-brand-orange">
        <div>
          <h1 className="text-balance text-3xl font-bold">Nous contacter</h1>
          <p className="mt-4">
            Une date à ajouter, une erreur à corriger, une question : écrivez-nous à{' '}
            <a href="mailto:contact@goazen.info">contact@goazen.info</a> ou sur{' '}
            <a href="https://www.instagram.com/goazen.info/" target="_blank" rel="noopener">
              Instagram
            </a>
            . Le formulaire ci-dessous arrive dans la même boîte.
          </p>
          <p className="mt-4">
            <strong>Vous organisez un événement ?</strong> Le plus rapide est de le publier
            directement avec le <Link href="/formulaire">formulaire dédié</Link> : c&apos;est
            gratuit et sans compte à créer. Pour une prestation, voyez l&apos;
            <Link href="/pro">espace pro</Link>.
          </p>
        </div>

        <div className="mt-8">
          <ContactFormBlock />
        </div>
      </div>
    </>
  )
}
