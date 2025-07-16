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
import Categories from './collections/Categories'
import Locations from './collections/Locations'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { buildEventSEODescription, buildEventSEOTitle } from './config-utils'
import Cities from './collections/Cities'
import SpecialEvents from './collections/SpecialEvents'
import { ShowSpecialEvent } from './app/globals/ShowSpecialEvent'

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
  collections: [Users, Medias, Events, Categories, Locations, Cities, SpecialEvents],
  editor: lexicalEditor(),
  globals: [ImagePlaceholder, ShowSpecialEvent],
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
      collections: ['events', 'locations'],
      generateTitle: async ({ doc }) => {
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
  ],
})

export default config
