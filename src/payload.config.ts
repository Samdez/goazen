// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { BoldFeature, lexicalEditor, LinkFeature } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import Users from './collections/Users'
import Medias from './collections/Medias'
import { s3Storage } from '@payloadcms/storage-s3'
import { ImagePlaceholder } from './app/globals/ImagePlaceholder'
import Events from './collections/Events'
import Pages from './collections/Pages'
import Categories from './collections/Categories'
import Locations from './collections/Locations'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { buildEventSEODescription, buildEventSEOTitle } from './config-utils'
import Cities from './collections/Cities'
import SpecialEvents from './collections/SpecialEvents'
import EmailConsents from './collections/EmailConsents'
import { mcpPlugin } from '@payloadcms/plugin-mcp'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const config = buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      afterDashboard: [
        '/app/(app)/components/ExportPaysBasque',
        '/app/(app)/components/ExportLandes',
        '/app/(app)/components/ExportSpecialEvent',
        '/app/(app)/components/ExportSpecialEventSelection',
      ],
    },
  },
  collections: [
    Users,
    Medias,
    Events,
    Pages,
    Categories,
    Locations,
    Cities,
    SpecialEvents,
    EmailConsents,
  ],
  editor: lexicalEditor(),
  globals: [ImagePlaceholder],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
    connectOptions: {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 15000,
      maxIdleTimeMS: 10000,
      connectTimeoutMS: 5000,
      minPoolSize: 1,
      maxPoolSize: 5,
      maxConnecting: 2,
      waitQueueTimeoutMS: 5000,
    },
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    s3Storage({
      collections: {
        medias: true,
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: process.env.S3_REGION,
      },
    }),
    seoPlugin({
      collections: ['events', 'locations', 'pages'],
      generateTitle: async ({ doc }) => {
        //Pages collection: no auto-generation logic, fall back to the page title
        if ('content' in doc && 'published' in doc) {
          return doc.title ?? ''
        }
        //if the doc is an event, we use the buildEventSEOMetadata function
        if ('price' in doc || 'title' in doc) {
          return buildEventSEOTitle(doc)
        }
        //doc is a Location
        if ('place_id' in doc) {
          const city = await fetch(`https://goazen.info/api/cities/${doc['city V2']}`).then((res) =>
            res.json(),
          )
          return `Concerts & soirées à ${doc.name} ${city.name} - Programmation | Goazen`
        }
        return ''
      },
      generateDescription: async ({ doc }) => {
        //Pages collection: no auto-generation logic
        if ('content' in doc && 'published' in doc) {
          return ''
        }
        //if the doc is an event, we use the buildEventSEOMetadata function
        if ('price' in doc || 'title' in doc) {
          return buildEventSEODescription(doc)
        }
        //doc is a Location
        if ('place_id' in doc) {
          const city = await fetch(`https://goazen.info/api/cities/${doc['city V2']}`).then((res) =>
            res.json(),
          )
          return `Découvrez tous les concerts et DJ sets à ${doc.name} à ${city.name}. Programmation complète, billetterie et infos pratiques sur Goazen, votre guide des sorties musicales.`
        }
        return ''
      },
      tabbedUI: true,
    }),
    mcpPlugin({
      collections: {
        events: {
          description:
            'Musical events and soirées (concerts, DJ sets) with title, date, price, region (pays-basque or landes), category and location.',
          enabled: { create: true, find: true, update: true },
        },
        locations: {
          description: 'Venues / concert halls where events take place.',
          enabled: { create: true, find: true, update: true },
        },
        categories: {
          description: 'Music genre / event type categories.',
          enabled: { create: true, find: true, update: true },
        },
        cities: {
          description: 'Cities in the Pays Basque and Landes areas.',
          enabled: { create: true, find: true, update: true },
        },
        pages: {
          description: 'SEO landing pages created by the weekly SEO pipeline.',
          enabled: { create: true, find: true, update: true, delete: true },
        },
        'special-events': {
          description: 'Special one-off events on Goazen.',
          enabled: { create: true, find: true, update: true },
        },
        medias: {
          description: 'Uploaded media files (images) used by events.',
          enabled: { create: true, find: true, update: true },
        },
        'email-consents': {
          description: 'Email consent records — read-only.',
          enabled: { find: true },
        },
        users: {
          description: 'User accounts — read-only.',
          enabled: { find: true },
        },
      },
    }),
  ],
})

export default config
