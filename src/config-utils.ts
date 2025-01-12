'use server'

import { getPayload } from 'payload'
import config from '@payload-config'

export async function buildEventSEOTitle(doc: any) {
  const payload = await getPayload({ config })
  const location =
    doc.location &&
    (await payload.findByID({
      collection: 'locations',
      id: doc.location,
    }))
  const date = new Date(doc.date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  console.log(location)
  const locationName = location?.name || doc.location_alt?.split(/[-/,]/)?.at(0) || ''
  const cityName = location?.city || doc.location_alt?.split(/[-/,]/)?.at(1) || ''
  const title = `${doc.title} - ${locationName.trim()}, ${cityName.trim()} ${date}`

  const maxLength = 45
  const truncatedTitle =
    title.length <= maxLength
      ? `${title} | Concert`
      : `${title.substring(0, maxLength)}... | Concert`

  return truncatedTitle
}

export async function buildEventSEODescription(doc: any) {
  const payload = await getPayload({ config })
  const location =
    doc.location &&
    (await payload.findByID({
      collection: 'locations',
      id: doc.location,
    }))
  const date = new Date(doc.date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const locationName = location?.name || doc.location_alt?.split(/[-/,]/)?.at(0) || ''
  const cityName = location?.city || doc.location_alt?.split(/[-/,]/)?.at(1) || ''

  const baseDesc = `Découvrez ${doc.title} en concert à ${locationName.trim()} ${cityName.trim()} le ${date}.`
  const description = doc.description
    ? `${baseDesc} ${doc.description.substring(0, 145 - baseDesc.length)}...`
    : `${baseDesc} Réservez vos places pour ce concert live au Pays Basque.`

  return description
}
